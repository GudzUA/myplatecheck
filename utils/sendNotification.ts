export async function sendNotification(
  to: string,
  subject: string,
  message: string
) {
  try {
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "MyPlateCheck",
        email: to,
        message: `${subject}\n\n${message}`,
      }),
    });
  } catch (error) {
    console.error("❌ Error sending notification:", error);
  }
}
