export async function safeQuery<T>(promise: Promise<{ data: T; error: any }>) {
  const { data, error } = await promise;
  if (error) {
    console.error(error);
    throw new Error(error.message || 'Something went wrong');
  }
  return data;
}