const API_URL = import.meta.env.VITE_API_URL || "api";

export async function logEvent(event) {
	try {
		await fetch(`/api/log`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(event),
		});
	} catch {
		
	}
}
