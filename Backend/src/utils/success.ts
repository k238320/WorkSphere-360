export async function handleSuccessResponse(
  message: string,
  statusCode: number,
  data: any,
) {
  return {
    message,
    status: 'success',
    statusCode,
    data: await data,
  };
}
