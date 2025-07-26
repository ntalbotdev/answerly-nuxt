export async function uploadImage(
	file: File,
	type: "avatar" | "banner"
): Promise<string | null> {
	const supabase = useSupabaseClient();
	const bucketId = "profile-assets"; // Supabase storage bucket ID

	const {
		data: { user },
		error: authErr,
	} = await supabase.auth.getUser();

	if (authErr || !user) throw new Error("Not authenticated");

	const filePath = `${user.id}/${type}.webp`;

	try {
		const { error: uploadErr } = await supabase.storage
			.from(bucketId)
			.upload(filePath, file, {
				upsert: true,
				contentType: file.type,
			});

		if (uploadErr) console.error("Upload failed:", uploadErr);

		const { data } = supabase.storage.from(bucketId).getPublicUrl(filePath);

		const urlWithTimestamp = data?.publicUrl
			? `${data.publicUrl}?t=${Date.now()}`
			: null;
		return urlWithTimestamp;
	} catch (err) {
		console.error("Image upload error:", err);
		throw new Error("Failed to upload image");
	}
}
