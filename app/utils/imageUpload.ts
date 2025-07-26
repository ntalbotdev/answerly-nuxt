export async function uploadImage(
	file: File,
	type: "avatar" | "banner",
	userId: string
): Promise<string | null> {
	const supabase = useSupabaseClient();
	const filePath = `${userId}/${type}.webp`;

	try {
		const { error } = await supabase.storage
			.from("profile-assets")
			.upload(filePath, file, {
				upsert: true,
				contentType: file.type,
			});

		if (error) {
			console.error("Upload error:", error);
			return null;
		}

		const { data } = supabase.storage
			.from("profile-assets")
			.getPublicUrl(filePath);

		const urlWithTimestamp = data?.publicUrl
			? `${data.publicUrl}?t=${Date.now()}`
			: null;
		return urlWithTimestamp;
	} catch (err) {
		console.error("Upload exception:", err);
		return null;
	}
}
