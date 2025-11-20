import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Legacy page: redirected to protected dashboard. The timetable features
// have been moved into `TimetablePanel` and the role dashboards.
export default function CollegeTimetableApp() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);
  return null;
}
