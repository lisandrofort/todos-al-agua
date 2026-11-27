import "../theme.css";
import "./Home.css";
import Header from "../components/Header";
import Hero from "../components/Hero";
import HomeSideCards from "../components/HomeSideCards";
import Activities from "../components/Activities";
import Teaching from "../components/Teaching";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { linksPara } from "../utils/navLinks";

const navLinks = linksPara("home");

export default function Home() {
  return (
    <div className="home">
      <Header links={navLinks} />

      <main>
        <Hero />
        <HomeSideCards />
        <Activities />
        <Teaching />
        <Contact />
      </main>

      <Footer links={navLinks} />
    </div>
  );
}
