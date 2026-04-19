export function Dashboard(props) {
  const items = props.user?.orders?.items ?? [];

  return (
    <section>
      <h2>Orders</h2>
      <p>{items.length} items loaded.</p>
    </section>
  );
}
