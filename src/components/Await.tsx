import { createSignal, Show, type JSXElement } from "solid-js";

interface Props<T> {
    for: Promise<T>;
    pending?: JSXElement;
    then?: (resolved: T) => JSXElement;
    catch?: (rejected: any) => JSXElement;
}
export function Await<T>({ for: promise, catch: catchJsx, pending, then }: Props<T>) {
    let [state, setState] = createSignal(0);
    let [resolved, setResolved] = createSignal<T>();
    let [rejected, setRejected] = createSignal();

    promise
        .then((value) => {
            setState(() => 1);
            setResolved(() => value);
        })
        .catch((exception) => {
            setState(() => 2);
            setRejected(() => exception);
        });

    return <>
        <Show when={state() === 0}>
            {pending ? pending : null}
        </Show>
        <Show when={state() === 1}>
            {then ? then(resolved() as T) : null}
        </Show>
        <Show when={state() === 2}>
            {catchJsx ? catchJsx(rejected()) : null}
        </Show>
    </>
}