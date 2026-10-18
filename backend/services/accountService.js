export function isDemoEmail(email = "") {
  const domain = email.trim().toLowerCase().split("@")[1] || "";
  return (
    /(^|\.)(test|invalid|example|localhost)$/.test(domain) ||
    /(^|\.)example\.(com|net|org)$/.test(domain)
  );
}

export function isDemoAccount(user) {
  return Boolean(user?.isDemoAccount || isDemoEmail(user?.email));
}

export function needsTeacherApproval(user) {
  return (
    user.role === "instructor" &&
    user.teacherApproval &&
    user.teacherApproval !== "approved"
  );
}

export function teacherApprovalMessage(user) {
  return user.teacherApproval === "rejected"
    ? "Your teacher application was not approved. Contact the administrator for help."
    : "Your teacher account is awaiting admin approval. Please sign in after it is approved.";
}
