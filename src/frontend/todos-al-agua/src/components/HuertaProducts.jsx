import { categories } from "../data/huerta";
import SectionHeading from "../ui/SectionHeading";
import "./HuertaProducts.css";

export default function HuertaProducts() {
  return (
    <section className="section section--soft" id="productos">
      <div className="container">
        <SectionHeading
          eyebrow="Producción"
          title="Lo que cultivan y elaboran"
          description="Plantines, semillas y panificados sin TACC del proyecto Flor de Pan. No publicamos precios: consultalos directamente según temporada y disponibilidad."
        />

        <div className="huerta-grid">
          {categories.map((category) => (
            <article className="huerta-category" key={category.categoria}>
              <h3>{category.categoria}</h3>

              <ul className="huerta-items">
                {category.items.map((item) => (
                  <li className="huerta-item" key={item.nombre}>
                    <div className="huerta-item-info">
                      <p className="huerta-item-name">{item.nombre}</p>
                      {item.descripcion && (
                        <p className="huerta-item-desc">{item.descripcion}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="huerta-ventas">
          <h3>¿Dónde los encontrás?</h3>
          <ul>
            <li>
              <strong>Vivero:</strong> viernes desde las 10:00, Calle 14 casi 59
              (Barrio Puerto).
            </li>
            <li>
              <strong>Panificados:</strong> fines de semana y feriados en la
              Feria 4 Estaciones del Parque Miguel Lillo, y en comercios
              adheridos de la playa.
            </li>
            <li>
              <strong>Por pedido:</strong> llamá al 2262-50-9574.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
