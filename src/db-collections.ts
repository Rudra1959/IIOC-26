import { createCollection, localOnlyCollectionOptions } from "@tanstack/db";

export interface Message {
	id: string;
	text: string;
	user: string;
	createdAt: number;
}

export const messagesCollection = createCollection(
	localOnlyCollectionOptions<Message>({
		id: "demo-messages",
		getKey: (message) => message.id,
		initialData: [],
	}),
);
