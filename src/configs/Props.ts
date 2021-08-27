import { RouteComponentProps } from "react-router-dom";

type TParams = {
    id?: string;
}

type TState = {
}

interface ExportProps extends RouteComponentProps<TParams, any, TState> {
}

interface Props extends RouteComponentProps {
}

export type { Props, ExportProps };
