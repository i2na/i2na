import { CardScene } from "./features/card/ui/CardScene";
import { DOCK_ITEMS } from "./config/dock.constants";

function App() {
    return (
        <div className="app">
            <header className="app__header">
                <h1 className="app__eyebrow">Identity Card</h1>
            </header>

            <main className="app__main">
                <CardScene />
            </main>

            <footer className="app__dock" aria-label="Quick actions">
                {DOCK_ITEMS.map((item) => (
                    <a
                        className="app__dock-link"
                        href={item.href}
                        key={item.label}
                        rel={item.external ? "noreferrer" : undefined}
                        target={item.external ? "_blank" : undefined}
                    >
                        {item.label}
                    </a>
                ))}
            </footer>
        </div>
    );
}

export default App;
