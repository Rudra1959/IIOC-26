import { useCallback, useEffect, useState } from "react";

interface PushSubscriptionData {
	endpoint: string;
	keys: {
		p256dh: string;
		auth: string;
	};
}

interface UsePushNotificationsReturn {
	permission: NotificationPermission;
	isSupported: boolean;
	subscription: PushSubscriptionData | null;
	isSubscribed: boolean;
	isLoading: boolean;
	requestPermission: () => Promise<NotificationPermission>;
	subscribe: () => Promise<PushSubscriptionData | null>;
	unsubscribe: () => Promise<void>;
	sendTestNotification: () => Promise<void>;
}

const VAPID_PUBLIC_KEY =
	"BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

export function usePushNotifications(): UsePushNotificationsReturn {
	const [permission, setPermission] =
		useState<NotificationPermission>("default");
	const [subscription, setSubscription] = useState<PushSubscriptionData | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(true);

	const isSupported =
		"Notification" in window &&
		"serviceWorker" in navigator &&
		"PushManager" in window;

	useEffect(() => {
		if (!isSupported) {
			setIsLoading(false);
			return;
		}

		setPermission(Notification.permission);

		navigator.serviceWorker.ready.then((registration) => {
			registration.pushManager.getSubscription().then((sub) => {
				if (sub) {
					setSubscription({
						endpoint: sub.endpoint,
						keys: {
							p256dh: sub.getKey("p256dh")
								? btoa(
										String.fromCharCode(
											...new Uint8Array(sub.getKey("p256dh")!),
										),
									)
								: "",
							auth: sub.getKey("auth")
								? btoa(
										String.fromCharCode(...new Uint8Array(sub.getKey("auth")!)),
									)
								: "",
						},
					});
				}
				setIsLoading(false);
			});
		});
	}, [isSupported]);

	const requestPermission =
		useCallback(async (): Promise<NotificationPermission> => {
			if (!isSupported) {
				throw new Error("Push notifications are not supported");
			}

			const result = await Notification.requestPermission();
			setPermission(result);
			return result;
		}, [isSupported]);

	const subscribe =
		useCallback(async (): Promise<PushSubscriptionData | null> => {
			if (!isSupported) {
				throw new Error("Push notifications are not supported");
			}

			const currentPermission = await requestPermission();
			if (currentPermission !== "granted") {
				throw new Error("Notification permission denied");
			}

			const registration = await navigator.serviceWorker.ready;
			const sub = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(
					VAPID_PUBLIC_KEY,
				) as BufferSource,
			});

			const subData: PushSubscriptionData = {
				endpoint: sub.endpoint,
				keys: {
					p256dh: sub.getKey("p256dh")
						? btoa(
								String.fromCharCode(
									...new Uint8Array(sub.getKey("p256dh") as ArrayBuffer),
								),
							)
						: "",
					auth: sub.getKey("auth")
						? btoa(
								String.fromCharCode(
									...new Uint8Array(sub.getKey("auth") as ArrayBuffer),
								),
							)
						: "",
				},
			};

			setSubscription(subData);
			return subData;
		}, [isSupported, requestPermission]);

	const unsubscribe = useCallback(async (): Promise<void> => {
		if (!isSupported) {
			throw new Error("Push notifications are not supported");
		}

		const registration = await navigator.serviceWorker.ready;
		const sub = await registration.pushManager.getSubscription();

		if (sub) {
			await sub.unsubscribe();
			setSubscription(null);
		}
	}, [isSupported]);

	const sendTestNotification = useCallback(async (): Promise<void> => {
		if (!isSupported) {
			throw new Error("Push notifications are not supported");
		}

		const registration = await navigator.serviceWorker.ready;

		await registration.showNotification("AirSentinel OS", {
			body: "Push notifications are working correctly!",
			icon: "/logo192.png",
			badge: "/logo192.png",
			tag: "test-notification",
			data: { url: "/dashboard" },
		});
	}, [isSupported]);

	return {
		permission,
		isSupported,
		subscription,
		isSubscribed: !!subscription,
		isLoading,
		requestPermission,
		subscribe,
		unsubscribe,
		sendTestNotification,
	};
}
