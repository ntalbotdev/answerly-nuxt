export async function callSupabaseEdgeFunction(
	functionName: string,
	method: "POST" | "DELETE" | "PUT" = "POST",
	body?: any
) {
	const config = useRuntimeConfig();
	const supabaseUrl = config.public.supabaseUrl;
	const supabaseAnonKey = config.public.supabaseKey;
	const edgeFunctionUrl = `${supabaseUrl}/functions/v1/${functionName}`;

	const res = await fetch(edgeFunctionUrl, {
		method,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${supabaseAnonKey}`,
		},
		body: body ? JSON.stringify(body) : undefined,
	});

	if (!res.ok) {
		const error = await res.text();
		throw new Error(error);
	}
	return res;
}
