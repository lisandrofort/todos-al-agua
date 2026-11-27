function PriceInput({ value, ariaLabel, onChange }) {
  return (
    <input
      className="admin-input admin-input--small"
      type="number"
      min="0"
      aria-label={ariaLabel}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function SizePrices({ precios, nombre, variante, onSizeChange }) {
  return (
    <div className="admin-price-pair">
      <label>
        <span>Chica</span>
        <PriceInput
          value={precios.chica}
          ariaLabel={`Precio chico de ${nombre} (${variante})`}
          onChange={(value) => onSizeChange("chica", value)}
        />
      </label>
      <label>
        <span>Grande</span>
        <PriceInput
          value={precios.grande}
          ariaLabel={`Precio grande de ${nombre} (${variante})`}
          onChange={(value) => onSizeChange("grande", value)}
        />
      </label>
    </div>
  );
}

export default function DishFields({
  item,
  index,
  onChange,
  onSizeChange,
  withLabels = false,
  variant = "editor",
  children,
}) {
  const variante = variant === "tarjeta" ? "tarjeta" : "tabla";
  const name = (
    <input
      className="admin-input admin-input--small"
      aria-label={`Nombre del plato ${index + 1} (${variante})`}
      placeholder="Nombre del plato"
      value={item.nombre}
      onChange={(event) => onChange({ nombre: event.target.value })}
    />
  );

  const descriptionInput = (
    <input
      className="admin-input admin-input--small"
      aria-label={`Descripción de ${item.nombre} (${variante})`}
      placeholder="Descripción"
      value={item.descripcion ?? ""}
      onChange={(event) => onChange({ descripcion: event.target.value })}
    />
  );

  const promotionInput = (
    <input
      className="admin-input admin-input--small"
      aria-label={`Promoción de ${item.nombre} (${variante})`}
      placeholder="Promoción (opcional)"
      value={item.promocion ?? ""}
      onChange={(event) => onChange({ promocion: event.target.value })}
    />
  );

  const desc = withLabels ? (
    <>
      <label className="admin-dish-card-field">
        <span className="admin-field-label">Descripción</span>
        {descriptionInput}
      </label>
      <label className="admin-dish-card-field">
        <span className="admin-field-label">Promoción (opcional)</span>
        {promotionInput}
      </label>
    </>
  ) : (
    <>
      {descriptionInput}
      {promotionInput}
    </>
  );

  const singlePrice = (
    <input
      className="admin-input admin-input--small"
      type="number"
      min="0"
      aria-label={`Precio de ${item.nombre} (${variante})`}
      value={item.precio ?? ""}
      onChange={(event) => onChange({ precio: event.target.value })}
    />
  );

  const price = item.precios ? (
    <SizePrices
      precios={item.precios}
      nombre={item.nombre}
      variante={variante}
      onSizeChange={onSizeChange}
    />
  ) : withLabels ? (
    <label>
      <span className="admin-field-label">Precio</span>
      {singlePrice}
    </label>
  ) : (
    singlePrice
  );

  return children({ name, desc, price });
}
