interface PosFinanceViewProps {
  title?: string;
}

export const PosFinanceView = ({ title = 'Pos Finance' }: PosFinanceViewProps) => {
  return <div>{title}</div>;
};
