import { Profile, Listing, Event, Tutor, Community } from "./types";

export interface RecommendationItem {
  id: string;
  type: "listing" | "event" | "tutor" | "community";
  title: string;
  subtitle: string;
  badge: string;
  score: number;
  whyRecommended: string;
  link: string;
  image?: string;
  actionText: string;
}

export function computeRecommendations(
  user: Profile,
  listings: Listing[],
  events: Event[],
  tutors: Tutor[],
  communities: Community[]
): RecommendationItem[] {
  const items: RecommendationItem[] = [];

  const userInterests = (user.interests || []).map((i) => i.toLowerCase());
  const userSkills = (user.skills || []).map((s) => s.toLowerCase());
  const userBranch = (user.branch || "").toLowerCase();
  const userCollegeId = user.college_id;

  // 1. Score Events
  events.forEach((evt) => {
    let score = 0;
    const reasons: string[] = [];

    // College match bonus
    if (evt.college_id === userCollegeId) {
      score += 35;
      reasons.push(`Happening at your campus (${evt.college?.short_name || "your college"})`);
    } else if (evt.level === "state") {
      score += 20;
      reasons.push("State-level event across Karnataka campuses");
    }

    // Keyword & Interest match
    const titleAndDesc = (evt.title + " " + evt.description + " " + evt.type).toLowerCase();
    const matchedInterests = userInterests.filter((interest) => titleAndDesc.includes(interest));
    if (matchedInterests.length > 0) {
      score += matchedInterests.length * 25;
      reasons.push(`Matches your interests in ${matchedInterests.join(", ")}`);
    }

    if (evt.registered_count && evt.registered_count > 100) {
      score += 15;
      reasons.push("High student participation trend");
    }

    items.push({
      id: evt.id,
      type: "event",
      title: evt.title,
      subtitle: `${evt.city} • ${new Date(evt.start_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`,
      badge: evt.type,
      score,
      whyRecommended: reasons[0] || "Trending upcoming campus event in Karnataka",
      link: `/events/${evt.id}`,
      image: evt.poster_url,
      actionText: evt.is_registered ? "Registered" : "Register Now",
    });
  });

  // 2. Score Marketplace Listings
  listings.forEach((item) => {
    if (item.seller_id === user.id || item.status !== "active") return;
    let score = 0;
    const reasons: string[] = [];

    if (item.college_id === userCollegeId) {
      score += 30;
      reasons.push("Available on your campus for zero-travel handoff");
    }

    const text = (item.title + " " + item.description + " " + item.category).toLowerCase();
    if (userBranch.includes("computer") || userBranch.includes("information")) {
      if (text.includes("algorithm") || text.includes("data structure") || text.includes("c++") || text.includes("vtu")) {
        score += 35;
        reasons.push("High relevance for CSE/ISE semester coursework");
      }
    }

    const matched = userSkills.filter((sk) => text.includes(sk));
    if (matched.length > 0) {
      score += matched.length * 20;
      reasons.push(`Relevant for your skills in ${matched.join(", ")}`);
    }

    if (item.price < 500) {
      score += 10;
    }

    items.push({
      id: item.id,
      type: "listing",
      title: item.title,
      subtitle: `₹${item.price.toLocaleString("en-IN")} • ${item.condition}`,
      badge: item.category,
      score,
      whyRecommended: reasons[0] || "Essential study resource for your branch",
      link: `/marketplace/${item.id}`,
      image: item.images[0],
      actionText: "View Item",
    });
  });

  // 3. Score Tutors
  tutors.forEach((t) => {
    if (t.user_id === user.id) return;
    let score = 0;
    const reasons: string[] = [];

    const tutorSubjects = t.subjects.map((s) => s.toLowerCase());
    const matched = userInterests.filter((interest) =>
      tutorSubjects.some((s) => s.includes(interest) || interest.includes(s))
    );

    if (matched.length > 0) {
      score += matched.length * 30;
      reasons.push(`Tutors in ${matched.join(", ")}`);
    }

    if (t.rating_avg >= 4.9) {
      score += 25;
      reasons.push(`Top-rated peer tutor (${t.rating_avg}★ with ${t.rating_count} reviews)`);
    }

    items.push({
      id: t.user_id,
      type: "tutor",
      title: t.profile?.full_name || "Peer Tutor",
      subtitle: `${t.subjects.slice(0, 2).join(", ")} • ₹${t.hourly_rate}/hr`,
      badge: `${t.rating_avg}★ Tutor`,
      score,
      whyRecommended: reasons[0] || "Experienced senior peer mentor",
      link: `/tutoring/${t.user_id}`,
      image: t.profile?.avatar_url,
      actionText: "Book Session",
    });
  });

  // 4. Score Communities
  communities.forEach((c) => {
    if (c.is_member) return;
    let score = 0;
    const reasons: string[] = [];

    const cText = (c.name + " " + c.description + " " + c.category).toLowerCase();
    const matched = userInterests.filter((interest) => cText.includes(interest));
    if (matched.length > 0) {
      score += matched.length * 25;
      reasons.push(`Aligns with your interests in ${matched.join(", ")}`);
    }

    if (c.member_count && c.member_count > 1000) {
      score += 15;
      reasons.push(`Active community with ${c.member_count.toLocaleString()} members`);
    }

    items.push({
      id: c.id,
      type: "community",
      title: c.name,
      subtitle: `${c.member_count?.toLocaleString()} Members • ${c.category}`,
      badge: c.category,
      score,
      whyRecommended: reasons[0] || "Top student community across Karnataka",
      link: `/communities/${c.id}`,
      actionText: "Join Community",
    });
  });

  // Sort descending by score
  return items.sort((a, b) => b.score - a.score).slice(0, 8);
}
