import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Admin from "./pages/Admin";
import Graphics from "./pages/Graphics";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Resume from "./pages/Resume";
import { AboutPage, ContactPage, ProjectsPage, SkillsPage, TrainingPage } from "./pages/SheunPages";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/graphics.html" component={Graphics} />
      <Route path="/resume.html" component={Resume} />
      <Route path="/about.html" component={AboutPage} />
      <Route path="/skills.html" component={SkillsPage} />
      <Route path="/projects.html" component={ProjectsPage} />
      <Route path="/training.html" component={TrainingPage} />
      <Route path="/contact.html" component={ContactPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router />
    </ErrorBoundary>
  );
}
