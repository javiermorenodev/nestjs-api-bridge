export class AuthResultDto {
  accessToken: string;
  user: {
    id: number;
    email: string;
  };
}
