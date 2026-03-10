import { useFieldContext, useFormContext } from "../hooks/demo.form-context";

export function TextField() {
	const field = useFieldContext<string>();

	return (
		<input
			value={field.state.value ?? ""}
			onBlur={field.handleBlur}
			onChange={(event) => field.handleChange(event.target.value)}
			className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
		/>
	);
}

export function TextArea() {
	const field = useFieldContext<string>();

	return (
		<textarea
			value={field.state.value ?? ""}
			onBlur={field.handleBlur}
			onChange={(event) => field.handleChange(event.target.value)}
			className="min-h-24 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
		/>
	);
}

export function Select() {
	const field = useFieldContext<string>();

	return (
		<select
			value={field.state.value ?? ""}
			onBlur={field.handleBlur}
			onChange={(event) => field.handleChange(event.target.value)}
			className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
		>
			<option value="">Select an option</option>
			<option value="one">Option one</option>
			<option value="two">Option two</option>
		</select>
	);
}

export function SubscribeButton() {
	const form = useFormContext();

	return (
		<button
			type="button"
			onClick={() => void form.handleSubmit()}
			className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black"
		>
			Submit
		</button>
	);
}
