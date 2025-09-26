import { Accessor, Setter } from "solid-js"

type RadioProps<T> = {
    signal: [Accessor<T>, Setter<T>],
    value: T,
} & Record<string, any>;

export function Radio<T>({signal, value, ...attr}: RadioProps<T>){
    return (
        <input
            type="radio"
            checked={value === signal[0]()}
            onInput={() => signal[1](() => value)}
            {...attr}
        />
    )
}