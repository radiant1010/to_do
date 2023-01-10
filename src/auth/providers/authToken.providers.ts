import { DataSource } from "typeorm";
import { AuthToken } from "../entities/authToken.entity";

export const authTokenProviders = [
  {
    provide: "AUTH_TOKEN_REPOSITORY",
    useFactory: (dataSource: DataSource) => dataSource.getRepository(AuthToken),
    inject: ["DATA_SOURCE"],
  },
];
