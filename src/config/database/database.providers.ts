import { User } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'to_do_user',
        password: 'Asdf1234!@',
        database: 'to_do',
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        //entities: [User],
        synchronize: true,
      });
      console.log(dataSource.options.entities);
      return dataSource.initialize();
    },
  },
];
