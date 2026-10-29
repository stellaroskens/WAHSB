export type FaqLink = {
  href: string
  label: string
}

export type FaqItem = {
  question: string
  paragraphs: readonly string[]
  points?: readonly string[]
  links?: readonly FaqLink[]
}

export type FaqCategory = {
  id: string
  title: string
  intro?: string
  items: readonly FaqItem[]
}

export const faqCategories: readonly FaqCategory[] = [
  {
    id: "faq-bowl-a-thon",
    title: "Bowl-A-Thon & Fundraising",
    intro:
      "The Bowl-A-Thon pledge page is a preview. It does not send, save, or collect a pledge, and it cannot take a payment.",
    items: [
      {
        question: "What is the Bowl-A-Thon?",
        paragraphs: [
          "The Bowl-A-Thon is a fundraiser for Albany High School Bowling. A supporter can give a flat donation or pledge an amount for each pin.",
          "The event date is not confirmed yet.",
        ],
      },
      {
        question: "How does the Bowl-A-Thon help our bowlers?",
        paragraphs: [
          "Fundraising supports the club’s bowling-related expenses, equipment, and competition opportunities.",
          "The club confirms any recognition before a sponsor is listed.",
        ],
      },
      {
        question: "What is a per-pin pledge?",
        paragraphs: [
          "A per-pin pledge is an amount you choose to give for each pin. After the event, that amount is multiplied by the bowler’s verified eligible pin total. Sponsors do not enter the pin total.",
          "For example, $0.10 per pin × 500 verified pins = $50. The example shows the math. It is not a predicted score.",
        ],
      },
      {
        question: "Can I make a flat donation instead?",
        paragraphs: [
          "Yes. A flat donation is a set amount, and it does not change with the pin total. Families and businesses can choose a flat donation or a per-pin pledge.",
        ],
      },
      {
        question: "How is my pledge calculated?",
        paragraphs: [
          "A per-pin pledge is calculated after the event: your amount per pin multiplied by the bowler’s verified eligible pin total. Sponsors do not enter that total.",
          "For example, $0.10 per pin × 500 verified pins = $50.",
          "The pledge page can show how the form is laid out. It does not calculate a payment, and online payments are not active.",
        ],
      },
      {
        question: "Can I set a maximum amount for my pledge?",
        paragraphs: [
          "Yes. A per-pin pledge can include an optional maximum. If you pledge $0.10 per pin and set a $30 maximum, the donation will not exceed $30, even when the calculated total is higher.",
        ],
      },
      {
        question: "When will I know how much I owe?",
        paragraphs: [
          "Per-pin pledges are calculated after the event. The club will confirm the bowler’s pin total and send the amount due with payment instructions. You do not need to guess the score.",
        ],
      },
      {
        question: "When and how do I make my donation?",
        paragraphs: [
          "Online payments are not active. The current pledge system is a preview and cannot take a payment.",
          "The club has said flat donations can be paid once payments are connected, and that per-pin sponsors receive payment instructions after the verified pin total is known. A donation deadline and a payment method have not been published. Ask the coaches before you send money.",
        ],
      },
      {
        question: "Can businesses sponsor a bowler?",
        paragraphs: [
          "Yes. Families and businesses can choose a flat donation or a per-pin pledge. The club confirms any recognition before a sponsor is listed.",
          "Sponsorship packages and business benefits are not published on this site. Ask the coaches.",
        ],
      },
      {
        question: "What does the fundraising money pay for?",
        paragraphs: [
          "Fundraising supports the club’s bowling-related expenses, equipment, and competition opportunities. A more detailed budget has not been published here.",
        ],
      },
      {
        question: "Is my donation tax deductible?",
        paragraphs: [
          "This site does not state that a donation is tax deductible. The club has not published its tax status. Do not treat a gift as tax deductible until the club confirms that in writing.",
        ],
      },
      {
        question: "What happens if a bowler cannot participate?",
        paragraphs: [
          "The club has not published a cancellation policy or a rule for a bowler who cannot take part. Contact the coaches before the event so they can tell you how a pledge should be handled.",
        ],
      },
    ],
  },
  {
    id: "faq-practices",
    title: "Practices & Participation",
    items: [
      {
        question: "Is registration open for the 2026–2027 season?",
        paragraphs: [
          "No. The Albany High School Bowling Club has reached capacity, and student registration is closed for the 2026–2027 season. We are not accepting additional student bowlers this season.",
          "Adults who want to support existing athletes can learn about volunteer opportunities instead.",
        ],
        links: [
          { href: "/volunteer", label: "VOLUNTEER OPPORTUNITIES" },
          { href: "/contact", label: "Contact the coaches" },
        ],
      },
      {
        question: "What should my child bring to bowling practice or lessons?",
        paragraphs: [
          "These are practical suggestions for athletes already participating with the club. Confirm current expectations with the coaches.",
        ],
        points: [
          "Comfortable clothing that allows movement",
          "Socks suitable for bowling shoes",
          "A water bottle",
          "Any personal bowling equipment they already own, if applicable",
          "A willingness to learn",
        ],
        links: [{ href: "/practices", label: "Practice information" }],
      },
      {
        question: "What should students wear?",
        paragraphs: [
          "Wear comfortable clothing that allows a full bowling approach. The club has not published a uniform, a jersey requirement, or a clothing rule.",
          "Fees and equipment expectations are not confirmed on this site. Ask a coach before you buy shoes or a ball.",
        ],
      },
      {
        question: "Where are practices held?",
        paragraphs: [
          "Practices are held at Lakeshore Lanes, 5432 Pacific Blvd SW, Albany, OR 97321. Days and times are not confirmed yet.",
        ],
        links: [{ href: "/practices", label: "See practice details" }],
      },
      {
        question: "When are practices scheduled?",
        paragraphs: [
          "Days and times are not confirmed yet. The current club site says practice information is coming soon. No dates or start times are posted here.",
        ],
        links: [{ href: "/practices", label: "Check the practices page" }],
      },
      {
        question: "Can parents watch practices?",
        paragraphs: [
          "The club has not published a spectator policy for practices. Ask the coaches before you plan to stay and watch.",
        ],
      },
      {
        question: "How do students learn the correct bowling technique?",
        paragraphs: [
          "Coaches teach the approach, release, and scoring at practice for athletes on the roster. This site does not publish a lesson plan or a required teaching method.",
        ],
        links: [{ href: "/our-club#coaches", label: "Meet the coaches" }],
      },
      {
        question: "Can students practice outside regular club sessions?",
        paragraphs: [
          "The club has not published a requirement to bowl outside club sessions, and it has not published permission to use a center on your own. Ask the coaches before you arrange extra practice.",
        ],
      },
      {
        question: "What happens if a student misses practice?",
        paragraphs: [
          "The club has not published an attendance policy. If a student will miss practice, contact the coaches and ask what they would like the family to do.",
        ],
      },
      {
        question: "Can adults volunteer with the club?",
        paragraphs: [
          "Yes. Student registration for the 2026–2027 season is closed, but adult volunteer opportunities are still available. The club welcomes adults interested in supporting existing athletes through event help, fundraising, setup, general assistance, and transportation when additional approval is granted.",
        ],
        links: [{ href: "/volunteer", label: "VOLUNTEER OPPORTUNITIES" }],
      },
      {
        question: "How does volunteer background screening work?",
        paragraphs: [
          "Albany High School Bowling uses Sterling Volunteers as its preferred third-party background-screening provider for adult volunteers.",
          "Contact club leadership before ordering a screening. Completing a background check does not mean you are automatically authorized to volunteer. This website does not collect screening applications or sensitive personal information.",
        ],
        links: [
          { href: "/volunteer#volunteer-background-checks", label: "Background check information" },
          { href: "/contact", label: "Contact club leadership" },
        ],
      },
      {
        question: "Do volunteer drivers need extra authorization?",
        paragraphs: [
          "Yes. Helping with student transportation is separate from general volunteer screening. Drivers may need additional authorization such as a license, insurance proof, an MVR review when required, and written approval from club leadership or applicable school procedures.",
          "This site does not claim that a standard Sterling Volunteers package includes an MVR review.",
        ],
        links: [{ href: "/volunteer#volunteer-transport-heading", label: "Transportation volunteer details" }],
      },
    ],
  },
  {
    id: "faq-equipment",
    title: "Bowling Balls, Shoes & Equipment",
    intro:
      "House balls and rental shoes are commonly offered at bowling centers. Availability, sizes, costs, and permission to use them during a club practice or a tournament vary. Confirm the plan with the coaches before each event.",
    items: [
      {
        question: "Does my child need to own a bowling ball?",
        paragraphs: [
          "This site does not require students to own a bowling ball. Many bowlers start with equipment available at the center, but that availability is not guaranteed for club practices.",
          "Ask a coach before you buy a ball.",
        ],
      },
      {
        question: "Are bowling balls available at practices?",
        paragraphs: [
          "Do not assume a house ball will be available at Lakeshore Lanes for a club practice. Families should confirm equipment arrangements with the coaches before practice.",
        ],
      },
      {
        question: "Are bowling balls available at tournaments?",
        paragraphs: [
          "Bowling centers often have house balls, and some tournaments limit which balls may be used. This site does not guarantee that a student can borrow a ball at a tournament venue.",
          "Confirm equipment arrangements with the coaches before each event.",
        ],
        links: [{ href: "/tournaments", label: "Tournament venues" }],
      },
      {
        question: "Do students need to bring their own bowling shoes?",
        paragraphs: [
          "Appropriate bowling footwear is required on the bowling approach. That does not mean a student must own bowling shoes.",
          "Ask a coach before you buy shoes, and confirm whether rental shoes are part of the plan for that practice or event.",
        ],
      },
      {
        question: "Are rental bowling shoes available?",
        paragraphs: [
          "Many bowling centers rent shoes. Sizes, cost, and whether rentals may be used for a club practice or tournament are not guaranteed here.",
          "Confirm equipment arrangements with the coaches before each event.",
        ],
      },
      {
        question: "Are bowling shoes provided?",
        paragraphs: [
          "This site does not say that bowling shoes are provided. Athletes on the roster do not have to own bowling shoes to bowl, and many centers rent shoes.",
          "Sizes, cost, and whether a rental is part of a club practice or tournament are not guaranteed here. Confirm the plan with the coaches before you buy shoes and before each event.",
        ],
        links: [{ href: "/contact", label: "Contact the coaches" }],
      },
      {
        question: "Can students wear regular sneakers while bowling?",
        paragraphs: [
          "Regular sneakers are not bowling shoes. The approach is meant for bowling footwear, which has a sliding sole, and street shoes can mark the approach.",
          "Ask the coaches and the bowling center what footwear is allowed. Do not assume sneakers are acceptable.",
        ],
      },
      {
        question: "What bowling-ball weight should a beginner use?",
        paragraphs: [
          "There is no single beginner weight on this site. For athletes already bowling with the club, a useful ball is one the student can swing smoothly without dropping it or forcing the shot. Coaches can help a student try weights.",
          "Under USBC equipment specifications, a bowling ball may not weigh more than 16 pounds. That maximum is not a recommendation to start at 16 pounds.",
        ],
      },
      {
        question: "What is the difference between a house ball and a custom-fitted ball?",
        paragraphs: [
          "A house ball is center equipment with finger holes sized for many people to share. A custom-fitted ball is drilled for one bowler’s hand and style.",
          "Athletes on the roster do not need a custom-fitted ball. Ask a coach before you order one.",
        ],
      },
      {
        question: "When should a student consider buying personal equipment?",
        paragraphs: [
          "Personal equipment is optional. A family can consider shoes or a fitted ball when the student is bowling regularly with the club and a coach suggests a fitting.",
          "Fees and equipment expectations are not confirmed on this site.",
        ],
      },
      {
        question: "Where can we purchase or have bowling equipment fitted?",
        paragraphs: [
          "The Bowling Resources page lists pro shops the club has been given, including fitting and drilling services. Contact each shop to confirm current services, hours, and availability. Listing a shop is not an endorsement of a price or a package.",
        ],
        links: [{ href: "/resources", label: "Bowling Resources" }],
      },
    ],
  },
  {
    id: "faq-basics",
    title: "Bowling Basics & Leagues",
    intro:
      "These answers describe standard tenpin bowling. They are general explanations, not Albany High School Bowling rules. Where a league or tournament uses its own procedure, follow the coaches and the event rules.",
    items: [
      {
        question: "How does bowling scoring work?",
        paragraphs: [
          "A game has 10 frames. In each of the first nine frames, a bowler rolls up to two balls unless the first ball is a strike. The score adds the pins knocked down, plus a bonus when the bowler marks.",
          "A strike scores 10 plus the next two deliveries. A spare scores 10 plus the next delivery. An open frame scores only the pins knocked down with those two deliveries.",
          "In the 10th frame, a strike earns two extra deliveries and a spare earns one extra delivery. USBC explains this in its “How to Score a Game” guide.",
        ],
      },
      {
        question: "What is a strike?",
        paragraphs: [
          "A strike means all 10 pins are knocked down with the first ball of a frame. USBC scores it as 10 plus the pins knocked down on the next two deliveries.",
        ],
      },
      {
        question: "What is a spare?",
        paragraphs: [
          "A spare means all 10 pins are knocked down with two deliveries in the frame. USBC scores it as 10 plus the pins knocked down on the next delivery.",
        ],
      },
      {
        question: "How many frames are in a game?",
        paragraphs: [
          "A standard game of American tenpins has 10 frames. The 10th frame can include a third delivery after a strike or a spare.",
        ],
      },
      {
        question: "What is a bowling average?",
        paragraphs: [
          "A bowling average is total pinfall divided by the number of games bowled. Tournaments may have their own rules for which average a bowler enters.",
          "Albany High School Bowling has not published an average requirement for athletes on the roster.",
        ],
      },
      {
        question: "What is a Baker game?",
        paragraphs: [
          "A Baker game is a team game. USBC describes the Baker system as two or more bowlers following one another in order. Each bowler completes one frame, and the 10 frames together are one team score.",
          "On a five-bowler team, a common rotation is bowler 1 in frames 1 and 6, bowler 2 in frames 2 and 7, and so on through bowler 5 in frames 5 and 10.",
          "Albany High School Bowling uses Baker format, where five bowlers complete one game together. A lineup order for this season is not confirmed. An earlier club website described teams of eight, with five bowling at a time, and 20 Baker games at each tournament. That schedule is not confirmed for the current season.",
        ],
      },
      {
        question: "How does team bowling work?",
        paragraphs: [
          "In ordinary team bowling, each bowler has a personal score and those scores are added. In Baker format, teammates share the frames of one game and the team has one score.",
          "This club uses Baker format. Five bowlers complete one game together, so one student does not have to carry every frame. Who bowls, and in which order, is not published for the current season. Ask the coaches.",
        ],
      },
      {
        question: "What is lane courtesy?",
        paragraphs: [
          "Lane courtesy means waiting so you do not distract a bowler who is already on the approach. Many centers use one-lane courtesy: if two bowlers on neighboring lanes are both ready, the bowler on the right goes first.",
          "The center or the coaches will say which courtesy applies that day. This page does not set a club rule.",
        ],
      },
      {
        question: "What is a bowling league?",
        paragraphs: [
          "A bowling league is an organized schedule of games, usually at the same center, with teams bowling over a season. High school club bowling is not the same thing as a commercial youth league.",
          "Albany High School Bowling has not published league membership requirements on this site.",
        ],
      },
      {
        question: "Do students need a certain average to compete?",
        paragraphs: [
          "No average requirement is published here for athletes already on the roster. Event eligibility is confirmed by the coaches, not by this website. Student registration for the 2026–2027 season is closed.",
        ],
      },
      {
        question: "What happens during a bowling tournament?",
        paragraphs: [
          "Bowlers usually check in, bowl assigned games, and follow the center’s rules and the coaches’ instructions. This club’s tournaments use Baker format, with five bowlers completing one game together.",
          "This site lists practice-tournament dates and venues that the club has supplied. Years, start times, and check-in rules are not all confirmed. It does not publish a full tournament procedure.",
        ],
        links: [{ href: "/tournaments", label: "Practice tournaments" }],
      },
      {
        question: "How can a beginner improve their bowling?",
        paragraphs: [
          "Athletes who are newer to the sport improve by repeating a calm approach, learning spares, and asking the coaches to watch one thing at a time. Keeping lane courtesy and staying ready for a turn also helps a team.",
          "This site does not publish a practice plan or a target score. Student registration for the 2026–2027 season is closed.",
        ],
        links: [{ href: "/practices", label: "Practice information" }],
      },
    ],
  },
  {
    id: "faq-etiquette",
    title: "Tournament Conduct & Bowling Etiquette",
    intro:
      "These notes are for students and families. They describe the atmosphere the club is asking for. They are not a discipline code, and they do not replace a conversation with the coaches.",
    items: [
      {
        question: "What behavior is expected at tournaments?",
        paragraphs: [
          "Be ready for your turn, follow the coaches, respect lane courtesy, and treat teammates, opponents, officials, and center staff with courtesy. Encourage people. Leave food and drinks off the approach, and keep phones put away while you are bowling.",
        ],
      },
      {
        question: "Can parents coach their children during competition?",
        paragraphs: [
          "Please allow the coaches to provide instruction during practices and tournaments. Parents and spectators are asked not to call out instructions, criticize a shot, or interrupt a coach.",
          "Positive encouragement between shots is welcome.",
        ],
      },
      {
        question: "When is it appropriate to cheer?",
        paragraphs: [
          "Cheer between shots, after a bowler has finished the delivery. A loud cheer while someone is standing on the approach makes it harder to concentrate.",
        ],
      },
      {
        question: "Why is keeping noise down important?",
        paragraphs: [
          "Bowling asks for concentration, focus, and a repeatable approach. Conversations and sideline coaching during a delivery are distracting for every student on the pair of lanes, not only for one bowler.",
        ],
      },
      {
        question: "Are cell phones allowed on the lanes?",
        paragraphs: [
          "Bowlers are asked to keep phones put away while bowling so the approach stays clear and everyone can focus. The club has not published a separate phone penalty. If you need a phone for an emergency, step away and ask a coach.",
        ],
      },
      {
        question: "What is proper lane courtesy?",
        paragraphs: [
          "Stay off the approach until it is your turn, and wait if a bowler beside you is already preparing to roll. Many centers let the bowler on the right go first when two bowlers are ready at the same time.",
          "Follow the courtesy the coaches and the center announce that day.",
        ],
      },
      {
        question: "How should bowlers treat teammates and opponents?",
        paragraphs: [
          "Encourage teammates, accept a low game without blaming someone, and show the same respect to opponents. Good sportsmanship is part of representing South Albany, West Albany, and Lebanon as one club.",
        ],
      },
      {
        question: "Can parents photograph or record students?",
        paragraphs: [
          "Ask permission before sharing photographs of other students. The club has not published a full photo or recording policy. If you are unsure, ask a coach before you post.",
        ],
      },
      {
        question: "What should students do if they have a question during competition?",
        paragraphs: [
          "Ask a coach. Stay off the approach while you are waiting for the answer, and let the coach talk with officials or center staff if a scoring or equipment question needs them.",
        ],
      },
      {
        question: "What should spectators do if they disagree with a decision?",
        paragraphs: [
          "Stay in the spectator area and speak calmly with a coach away from the bowlers who are on the approach. Please do not argue a call from the seats or coach over the official.",
          "The club has not published a protest process. The coaches can tell you what the event allows.",
        ],
      },
      {
        question: "What time should families arrive?",
        paragraphs: [
          "The Tournaments page lists times that were published on the previous club website: arrive at 8:00 a.m., check in at 8:30 a.m., and bowling starts at 9:00 a.m.",
          "Those times are not confirmed for the current season. Confirm them with a coach before you travel.",
        ],
        links: [
          { href: "/tournaments", label: "Tournament details" },
          { href: "/contact", label: "Contact the coaches" },
        ],
      },
      {
        question: "What should students bring to a tournament?",
        paragraphs: [
          "The previous club website described a tournament uniform: the provided jersey on top, and black dress pants or black dress shorts with an inner seam of at least six inches. It also limited jeans, hats, and similar items. Confirm that guidance with a coach before a tournament.",
          "This site does not guarantee a house ball or rental shoes at a tournament venue, and athletes on the roster do not have to own a ball or shoes to compete. Ask a coach what to bring for that event.",
        ],
        links: [
          { href: "/tournaments", label: "Tournament details" },
          { href: "/contact", label: "Contact the coaches" },
        ],
      },
      {
        question: "Where should spectators sit or stand?",
        paragraphs: [
          "Stay off the bowling approach and in the spectator area. The club has not published assigned seats or a map of where families should stand.",
          "If you are unsure where to watch, ask a coach at the event.",
        ],
      },
      {
        question: "What should families do if they have concerns during a tournament?",
        paragraphs: [
          "Speak calmly with a coach away from bowlers who are on the approach. Please do not call instructions or argue a concern from the seats.",
          "The club has not published a separate process for family concerns during an event. Contact the coaches if you need to talk before or after the tournament.",
        ],
        links: [{ href: "/contact", label: "Contact the coaches" }],
      },
    ],
  },
]

export const faqNav = faqCategories.map((category) => ({
  id: category.id,
  title: category.title,
}))

export const bowlerGuidelines = [
  "Keep phones put away while bowling.",
  "Be ready when it is your turn.",
  "Follow coach instructions.",
  "Respect lane courtesy.",
  "Encourage teammates.",
  "Show good sportsmanship.",
  "Keep food and drinks away from the approach.",
] as const

export const spectatorGuidelines = [
  "Allow coaches to coach.",
  "Keep voices low during bowling.",
  "Avoid sideline instruction.",
  "Cheer positively at appropriate times.",
  "Respect officials and bowling-center staff.",
  "Stay in spectator areas.",
  "Ask permission before sharing photographs of other students.",
  "Support all three participating school communities as one bowling club.",
] as const

export const learningResources = [
  {
    href: "https://images.bowl.com/bowl/media/legacy/internap/bowl/rules/pdfs/ScoreHowto.pdf",
    label: "USBC: How to Score a Game",
  },
  {
    href: "https://images.bowl.com/bowl/media/assets/usbc/rules/general%20pdfs/usbc-tournament-managers-manual-(2026-update).pdf",
    label: "USBC Tournament Managers Manual, including the Baker system",
  },
] as const

export const questionTopics = [
  "Volunteering",
  "Student Participation",
  "Practices & Lessons",
  "Bowling Equipment",
  "Tournaments",
  "Bowl-A-Thon & Fundraising",
  "Other",
] as const
