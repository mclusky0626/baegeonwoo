import React from "react";
import { useTranslation } from "react-i18next";
import "./PrivacyPolicy.css";

export const PrivacyPolicy = () => {
  const { t } = useTranslation();
  return (
    <div className="privacy-policy">
      <h2>{t("privacy_policy_title")}</h2>
      <p>{t("privacy_policy_body")}</p>
    </div>
  );
};

export default PrivacyPolicy;
