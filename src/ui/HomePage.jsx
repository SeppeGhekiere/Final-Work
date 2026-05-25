import Background from "./Background";
import { regenerateSessionId } from "../state/gameState";

export default function HomePage({ onStart, onInfo, onProject }) {
	const handleStart = () => {
		regenerateSessionId();
		onStart();
	};

	return (
		<div className="homepage-1">
			<Background />
			<nav className="home-nav">
				<span className="home-logo">The Loop</span>
				<div className="home-nav-links">
					<button className="home-nav-start" onClick={onInfo}>Info</button>
					<button className="home-nav-start" onClick={onProject}>Project</button>
				</div>
			</nav>

			<section className="hero-10">
				<div className="hero-text">
					<h1 className="hero-heading">Realize what happens when you keep scrolling</h1>
					<p className="hero-sub">
						An interactive experience about attention, habit, and quiet loss of time.
					</p>
					<button className="hero-btn" onClick={handleStart}>
						Find Out
					</button>
				</div>
				<div className="hero-graphic">
					<img src="/image_hero_homepage.svg" alt="" className="hero-svg" />
				</div>
			</section>

			<section className="subhero-18">
				<p className="subhero-intro">
					What you&rsquo;re about to experience is a loop, the same one that plays out every time you reach
					for your phone without thinking. It&rsquo;s not about blame. It&rsquo;s about noticing.
				</p>
			</section>

			<section className="quote-29">
				<div className="quote-card">
					<blockquote className="quote-text">
						&ldquo;A lot of times, you might not even be aware you&rsquo;re doing it. But it becomes second
						nature: once you have a spare moment, you pick up your phone and start scrolling without even
						really being aware of it.&rdquo;
					</blockquote>
					<cite className="quote-attribution">Susan Albers</cite>
				</div>
			</section>
		</div>
	);
}
