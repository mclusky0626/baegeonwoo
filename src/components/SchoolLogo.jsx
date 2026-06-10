import React, { useMemo, useState } from "react";
import { getSchoolInitials, getSchoolLogoUrl, hasSchool } from "../utils/school";
import "./SchoolLogo.css";

export const SchoolLogo = ({ school, size = "md", className = "" }) => {
  const [failed, setFailed] = useState(false);
  const logoUrl = useMemo(() => getSchoolLogoUrl(school), [school]);
  const ready = hasSchool(school);
  const showImage = ready && logoUrl && !failed;

  return (
    <div className={`school-logo ${size} ${ready ? "" : "empty"} ${className}`} aria-hidden="true">
      {showImage ? (
        <img src={logoUrl} alt="" onError={() => setFailed(true)} />
      ) : (
        <span>{ready ? getSchoolInitials(school.schoolName) : "학"}</span>
      )}
    </div>
  );
};

export default SchoolLogo;
