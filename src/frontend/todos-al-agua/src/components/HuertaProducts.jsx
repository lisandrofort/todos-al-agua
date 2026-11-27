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

        <div className="huerta-fotos">
          <figure>
            <img
              src="/huerta/vivero-1.jpg"
              alt="Plantas y suculentas en el vivero de Flor de Pan"
            />
            <figcaption>
              Plantines y flores de estación en el vivero ·{" "}
              <a
                href="https://necocheadigital.com/nota/117413/abren-el-vivero-y-la-huerta-de-flor-de-pan-como-espacio-comunitario/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Necochea Digital ↗
              </a>
            </figcaption>
          </figure>
          <figure>
            <img
              src="/huerta/vivero-2.jpg"
              alt="Joven trabajando en la huerta del proyecto Flor de Pan"
            />
            <figcaption>
              El vivero abre los viernes de 10 a 12 hs en El Samaritano
            </figcaption>
          </figure>
        </div>

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
              <strong>Vivero:</strong> viernes de 10:00 a 12:00, Calle 14 Nº
              2949 (El Samaritano, Barrio Puerto).
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

          <div className="huerta-map-head">
            <span>El Samaritano · Calle 14 Nº 2949, Necochea</span>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Calle+14+2949%2C+Necochea%2C+Buenos+Aires%2C+Argentina"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cómo llegar ↗
            </a>
          </div>
          <div className="huerta-map-wrap">
            <iframe
              className="huerta-map"
              title="Ubicación del vivero Flor de Pan en El Samaritano, Necochea"
              src="https://www.google.com/maps?q=Calle+14+2949%2C+Necochea%2C+Buenos+Aires%2C+Argentina&z=15&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
