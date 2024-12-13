export type StatusType = "success" | "error";

export interface StatusMessageProps {
    type?: "success" | "error",
    message: string,
    programLength?: number
}

export function StatusCard(props: StatusMessageProps) {
    if (props.type === undefined) {
      return <></>;
    }

    return (
      <div className={props.type === "success" ? "success-card" : "error-card"}>
        {<p>{props.message}</p>}
        {props.programLength ? <p>Your program is {props.programLength} characters long. Can you make it shorter?</p> : <></>}
      </div>
    );
  }

export default StatusCard