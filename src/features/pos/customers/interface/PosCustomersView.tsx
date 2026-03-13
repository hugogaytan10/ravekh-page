interface PosCustomersViewProps {
  title?: string;
}

export const PosCustomersView = ({ title = 'Pos Customers' }: PosCustomersViewProps) => {
  return <div>{title}</div>;
};
