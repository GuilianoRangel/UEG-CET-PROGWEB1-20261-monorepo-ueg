export declare enum Role {
    USER = "user",
    ADMIN = "admin"
}
export declare class User {
    id: string;
    email: string;
    nome: string;
    senha: string;
    ativo: boolean;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=user.entity.d.ts.map