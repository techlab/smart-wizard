import { useRef, useState } from "react";
import { useSmartWizard } from "@smart-wizard/react";
import "./App.css";

function App() {
    const wizardRef = useRef<HTMLDivElement>(null);
    const [transitionType, setTransitionType] = useState("slideHorizontal");

    const { stepInfo, next, prev, reset, wizard } = useSmartWizard(wizardRef, {
        transition: { effect: transitionType as any, speed: 400 },
    });

    const handleTransitionChange = (type: string) => {
        setTransitionType(type);
        wizard?.setOptions({ transition: { effect: type as any, speed: 400 } });
    };

    const progress = stepInfo.totalSteps > 0
        ? ((stepInfo.currentStep + 1) / stepInfo.totalSteps) * 100
        : 0;

    return (
        <div className="app">
            <div className="container">
                <h1>SmartWizard — React Example</h1>
                <p className="subtitle">Built with React hooks and TypeScript</p>

                <div className="info-card">
                    <p><strong>Current Step:</strong> {stepInfo.currentStep + 1} of {stepInfo.totalSteps}</p>
                    <p><strong>Transition:</strong> {transitionType}</p>
                </div>

                <div className="transition-selector">
                    {["none", "fade", "slideHorizontal", "slideVertical"].map(type => (
                        <button
                            key={type}
                            className={`transition-btn ${transitionType === type ? "active" : ""}`}
                            onClick={() => handleTransitionChange(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* SmartWizard — core-compatible markup */}
                <div ref={wizardRef} id="smartwizard" className="sw-wizard">

                    <nav className="sw-nav" role="tablist">
                        <div className="sw-nav-item" data-step="1" role="tab">
                            <div className="badge">1</div>
                            <div className="info">
                                <span className="title">React</span>
                                <span className="desc">Hook setup</span>
                            </div>
                        </div>
                        <div className="sw-nav-item" data-step="2" role="tab">
                            <div className="badge">2</div>
                            <div className="info">
                                <span className="title">Hooks</span>
                                <span className="desc">API usage</span>
                            </div>
                        </div>
                        <div className="sw-nav-item" data-step="3" role="tab">
                            <div className="badge">3</div>
                            <div className="info">
                                <span className="title">TypeScript</span>
                                <span className="desc">Type safety</span>
                            </div>
                        </div>
                        <div className="sw-nav-item" data-step="4" role="tab">
                            <div className="badge">4</div>
                            <div className="info">
                                <span className="title">Done</span>
                                <span className="desc">Complete!</span>
                            </div>
                        </div>
                    </nav>

                    <div className="sw-panels">
                        <section className="sw-panel active" id="panel-1" role="tabpanel" hidden>
                            <div className="sw-title">Welcome to React Integration!</div>
                            <div className="sw-desc">SmartWizard integrates seamlessly with React using hooks.</div>
                            <ul className="feature-list">
                                <li>useSmartWizard hook for easy integration</li>
                                <li>Ref-based initialization</li>
                                <li>Reactive state updates</li>
                                <li>TypeScript support</li>
                            </ul>
                        </section>
                        <section className="sw-panel" id="panel-2" role="tabpanel" hidden>
                            <div className="sw-title">React Hooks Pattern</div>
                            <div className="sw-desc">The useSmartWizard hook provides a clean API.</div>
                            <pre className="code-block">{`const { stepInfo, next, prev, wizard } =
  useSmartWizard(wizardRef, options);`}</pre>
                        </section>
                        <section className="sw-panel" id="panel-3" role="tabpanel" hidden>
                            <div className="sw-title">Full TypeScript Support</div>
                            <div className="sw-desc">Enjoy complete type safety with TypeScript.</div>
                            <ul className="feature-list">
                                <li>Typed options and configuration</li>
                                <li>IntelliSense support</li>
                                <li>Compile-time error checking</li>
                                <li>Auto-completion for all methods</li>
                            </ul>
                        </section>
                        <section className="sw-panel" id="panel-4" role="tabpanel" hidden>
                            <div className="sw-title">Ready to Build!</div>
                            <div className="sw-desc">You are all set to use SmartWizard in your React application.</div>
                            <div className="action-buttons">
                                <button className="sw-btn sw-btn-outline" onClick={reset}>Reset Wizard</button>
                                <button className="sw-btn sw-btn-primary" onClick={() => alert("Wizard completed! 🎉")}>Complete</button>
                            </div>
                        </section>
                    </div>

                    <div className="sw-toolbar sw-toolbar-bottom">
                        <div className="sw-toolbar-group">
                            <button className="sw-btn sw-btn-outline sw-btn-prev" data-action="prev">← Back</button>
                        </div>
                        <div className="sw-toolbar-group">
                            <div className="sw-progress">
                                <div className="sw-progress-bar" role="progressbar"
                                    style={{ width: `${progress}%` }}
                                    aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} />
                            </div>
                        </div>
                        <div className="sw-toolbar-group">
                            <button className="sw-btn sw-btn-primary sw-btn-next" data-action="next">Next →</button>
                        </div>
                    </div>

                </div>

                <div className="external-controls">
                    <h3>External Controls</h3>
                    <div className="button-group">
                        <button onClick={prev} disabled={stepInfo.currentStep === 0}>← Previous</button>
                        <button onClick={next} disabled={stepInfo.currentStep === stepInfo.totalSteps - 1}>Next →</button>
                        <button onClick={reset}>Reset</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;