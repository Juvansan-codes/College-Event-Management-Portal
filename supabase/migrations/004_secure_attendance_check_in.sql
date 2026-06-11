-- Keep attendance tokens private and perform check-in atomically on the server.

DROP POLICY IF EXISTS "Attendees view active sessions" ON attendance_sessions;
DROP POLICY IF EXISTS "Users insert own attendance records" ON attendance_records;
DROP POLICY IF EXISTS "Enable insert for all attempt logging" ON attendance_logs;

CREATE OR REPLACE FUNCTION public.mark_event_attendance(
  p_token TEXT,
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_user_name TEXT,
  p_device_information TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session attendance_sessions%ROWTYPE;
  v_record attendance_records%ROWTYPE;
  v_haversine DOUBLE PRECISION;
  v_distance DOUBLE PRECISION;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'You must sign in before marking attendance.');
  END IF;

  IF coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') <> 'student' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only student accounts can mark attendance.');
  END IF;

  IF p_latitude NOT BETWEEN -90 AND 90 OR p_longitude NOT BETWEEN -180 AND 180 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid device location.');
  END IF;

  SELECT *
  INTO v_session
  FROM attendance_sessions
  WHERE token = p_token
    AND is_active = true
    AND expires_at > now()
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'QR Code is invalid or has expired. Please ask the organizer to generate a new one.'
    );
  END IF;

  v_haversine :=
    power(sin(radians((v_session.latitude::DOUBLE PRECISION - p_latitude) / 2)), 2)
    + cos(radians(p_latitude))
      * cos(radians(v_session.latitude::DOUBLE PRECISION))
      * power(sin(radians((v_session.longitude::DOUBLE PRECISION - p_longitude) / 2)), 2);

  v_distance := 2 * 6371000 * asin(sqrt(least(1, v_haversine)));

  IF v_distance > v_session.radius_meters THEN
    INSERT INTO attendance_logs (
      event_id,
      user_id,
      status,
      error_message,
      latitude,
      longitude,
      device_information
    )
    VALUES (
      v_session.event_id,
      v_user_id,
      'Failed_Radius',
      format(
        'Outside attendance radius: %s meters away; allowed radius is %s meters.',
        round(v_distance),
        v_session.radius_meters
      ),
      p_latitude,
      p_longitude,
      p_device_information
    );

    RETURN jsonb_build_object(
      'success', false,
      'error', format(
        'You are %s meters from the event location. The allowed radius is %s meters.',
        round(v_distance),
        v_session.radius_meters
      )
    );
  END IF;

  IF EXISTS (
    SELECT 1
    FROM attendance_records
    WHERE event_id = v_session.event_id
      AND user_id = v_user_id
  ) THEN
    INSERT INTO attendance_logs (
      event_id,
      user_id,
      status,
      error_message,
      latitude,
      longitude,
      device_information
    )
    VALUES (
      v_session.event_id,
      v_user_id,
      'Failed_Duplicate',
      'Attendance has already been marked for this event.',
      p_latitude,
      p_longitude,
      p_device_information
    );

    RETURN jsonb_build_object(
      'success', false,
      'error', 'You have already marked attendance for this event.'
    );
  END IF;

  INSERT INTO attendance_records (
    event_id,
    session_id,
    user_id,
    user_name,
    latitude,
    longitude,
    distance_meters,
    status,
    device_information
  )
  VALUES (
    v_session.event_id,
    v_session.id,
    v_user_id,
    coalesce(nullif(trim(p_user_name), ''), 'Student'),
    p_latitude,
    p_longitude,
    round(v_distance::NUMERIC, 1),
    'Present',
    p_device_information
  )
  RETURNING * INTO v_record;

  INSERT INTO attendance_logs (
    event_id,
    user_id,
    status,
    latitude,
    longitude,
    device_information
  )
  VALUES (
    v_session.event_id,
    v_user_id,
    'Success',
    p_latitude,
    p_longitude,
    p_device_information
  );

  RETURN jsonb_build_object(
    'success', true,
    'distance', v_distance,
    'record', to_jsonb(v_record)
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'You have already marked attendance for this event.'
    );
END;
$$;

REVOKE ALL ON FUNCTION public.mark_event_attendance(
  TEXT,
  DOUBLE PRECISION,
  DOUBLE PRECISION,
  TEXT,
  TEXT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.mark_event_attendance(
  TEXT,
  DOUBLE PRECISION,
  DOUBLE PRECISION,
  TEXT,
  TEXT
) TO authenticated;
