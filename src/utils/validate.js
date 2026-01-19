export function validateChatRequest(body) {
  const errors = [];
  if (!body) errors.push("Missing request body");
  if (!body.user_id || typeof body.user_id !== "string")
    errors.push("user_id is required");
  if (!body.session_id || typeof body.session_id !== "string")
    errors.push("session_id is required");
  if (!body.message || typeof body.message !== "string")
    errors.push("message is required");
  return errors;
}
