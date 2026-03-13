interface PosReportsViewProps {
  title?: string;
}

export const PosReportsView = ({ title = 'Pos Reports' }: PosReportsViewProps) => {
  return <div>{title}</div>;
};
