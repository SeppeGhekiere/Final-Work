import Background from "./Background";

export default function ProjectPage({ onStart, onHome, onInfo }) {
	return (
		<div className="project-page">
			<Background />
			<nav className="home-nav">
				<button className="home-logo home-logo-btn" onClick={onHome}>
					The Loop
				</button>
				<div className="home-nav-links">
					<button className="home-nav-start" onClick={onInfo}>
						Info
					</button>
					<span className="home-nav-current">Project</span>
				</div>
			</nav>

			<section className="project-hero">
				<h1 className="project-heading">About This Project</h1>
				<p className="project-lede">
					An interactive narrative about the loop you fall into every time you reach for your phone without
					thinking.
				</p>
			</section>

			<section className="project-section">
				<h2 className="project-section-title">What it is</h2>
				<p className="project-body">
					The Loop is a choice-driven experience that walks you through the familiar pattern of doomscrolling
					the unconscious reach, the pull of the next video, the minutes that slip away unnoticed. It is not a
					game in the traditional sense. There are no points, no win states, no failure screens.
				</p>
				<p className="project-body">
					Instead, it is a space to observe the mechanism from the inside. The narrative follows the arc of a
					single scrolling session from the first impulse, through the spiral, to the quiet aftermath. What
					you see and feel is shaped by the choices you make along the way.
				</p>
			</section>

			<section className="project-section">
				<h2 className="project-section-title">Why it exists</h2>
				<p className="project-body">
					The attention economy is built on a simple insight: if you can keep someone&rsquo;s eyes on a screen
					for one more second, you win. Every platform, every notification, every infinite scroll is optimised
					for that single goal. The cost is distraction, fragmentation, the slow erosion of sustained focus is
					borne entirely by the user.
				</p>
				<p className="project-body">
					This project does not try to solve that system. It tries to make it visible. The loop works because
					it is invisible; by the time you notice you are in it, the time is already gone. Making the loop
					visible is the first step toward reclaiming the space between impulse and action.
				</p>
			</section>

			<section className="project-section">
				<h2 className="project-section-title">How it works</h2>
				<p className="project-body">
					The narrative is driven by a branching scene graph. Every choice feeds into a set of player traits :
					awareness, tension, time loss, resistance which subtly redirect the story and alter the atmosphere
					through visual effects, dialogue shifts, and pacing. The same player will not see the same story
					twice.
				</p>
				<p className="project-body">
					A 3D mycelium network grows alongside the narrative in the background, serving as a visual metaphor
					for the interconnected nature of habit, attention, and the quiet infrastructure that shapes
					behaviour. The deeper you go, the more the environment responds.
				</p>
				<p className="project-body">
					The entire experience takes roughly five minutes. There is no right way to move through it. The
					intent is not to instruct, but to create room for reflection.
				</p>
			</section>

			<section className="project-section">
				<h2 className="project-section-title">What it wants</h2>
				<p className="project-body">
					The Loop does not want to make you put down your phone. It does not want to shame you for scrolling.
					It wants to insert a moment of pause, a hairline crack in the automatic sequence of reach, unlock,
					scroll, repeat.
				</p>
				<p className="project-body">
					If the experience does its job, you might notice the loop the next time it starts. Not with guilt,
					but with clarity. That noticing , the split second where you see the pattern before you act on it ,
					is the thing this project is built to cultivate.
				</p>
			</section>

			<section className="project-section">
				<h2 className="project-section-title">The mycelium metaphor</h2>
				<p className="project-body">
					Mycelium networks are the underground root structures that connect individual fungi across vast
					distances. They are invisible, pervasive, and quietly shape entire ecosystems. The comparison to the
					attention economy is intentional: the algorithms, notifications, and design patterns that guide your
					behaviour are just as invisible and just as pervasive.
				</p>
				<p className="project-body">
					The 3D mycelium that grows alongside the story is not decoration. It is a visualisation of that
					hidden layer, the architecture beneath the surface that determines what you see, when you see it,
					and how long you stay. As the narrative progresses, the mycelium grows and changes in response to
					your journey through the loop.
				</p>
			</section>

			<div className="project-footer">
				<button className="project-begin-btn" onClick={onStart}>
					Begin
				</button>
			</div>
		</div>
	);
}
