import { Cart } from "../../../../../../../api-types";

export type CartUpdateProperty<T extends keyof Cart> = Partial<Pick<Cart, T>>;
