interface PosDashboardViewProps {
  title?: string;
}

export const PosDashboardView = ({ title = 'Pos Dashboard' }: PosDashboardViewProps) => {
  return <div>{title}</div>;
};
