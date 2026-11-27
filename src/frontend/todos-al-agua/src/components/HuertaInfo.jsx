import Button from "../ui/Button";
import Eyebrow from "../ui/Eyebrow";
import FeatureList from "../ui/FeatureList";
import ScheduleCard from "../ui/ScheduleCard";
import "./Teaching.css";

const features = [
  "El vivero funciona en el Centro Integral de Prevención El Samaritano, Barrio Puerto.",
  "Los jóvenes aprenden el oficio, perciben un sueldo y fijan sus propios precios.",
  "Venden por pedido, en el vivero los viernes y en ferias locales.",
];

const schedule = [
  { label: "Vivero", value: "Viernes de 10:00 a 12:00" },
  { label: "Dirección", value: "Calle 14 Nº 2949, El Samaritano" },
  { label: "Panificados", value: "Feria 4 Estaciones, fines de semana y feriados" },
];

export default function HuertaInfo() {
  return (
    <section className="section" id="nosotros">
      <div className="container split">
        <div className="split-copy">
          <Eyebrow>Nuestra huerta</Eyebrow>
          <h2 className="text-subtitle">
            Un proyecto de inclusión que produce y aprende
          </h2>
          <p className="text-body">
            La huerta y el vivero son parte de «Flor de Pan, huerta y
            panificados», un proyecto de la Asociación Civil Todos al Agua que
            da formación y trabajo a jóvenes y adultos con discapacidad.
          </p>

          <FeatureList items={features} />

          <Button href="#productos">Ver qué producen</Button>
        </div>

        <ScheduleCard
          id="horarios"
          kicker="Dónde y cuándo"
          title="Cómo encontrarlos"
          schedule={schedule}
          note="La producción depende de la temporada. Para pedidos, llamá al 2262-50-9574."
          action={{ href: "#contacto", label: "Hacer una consulta" }}
        />
      </div>
    </section>
  );
}
