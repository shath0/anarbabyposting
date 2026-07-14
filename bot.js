// pathetic anarchist bluesky bot
// posts one procedurally-generated tweet from the desk of an armchair revolutionary.
//
// usage:
//   node bot.js            post once, then exit  (best for cron / scheduled workflows)
//   node bot.js --loop     stay running, post every POST_INTERVAL_MINUTES (default 240)
//   node bot.js --dry      generate + print, do NOT post  (no login required)
//   node bot.js --count    print the size of the generation space, then exit
//   node bot.js --sample   print 20 sample posts, then exit  (no login required)
//
// credentials come from env vars only — never hard-code them:
//   BLUESKY_HANDLE          e.g. pathetic-anarchist.bsky.social
//   BLUESKY_APP_PASSWORD    an APP PASSWORD (Settings > App Passwords), not your real password
//   POST_INTERVAL_MINUTES   optional, only used with --loop

import { AtpAgent, RichText } from '@atproto/api'

// ---------------------------------------------------------------------------
// the repo — mix-and-match phrase banks. add lines freely; the space multiplies.
// ---------------------------------------------------------------------------

const openers = [
  'just', 'genuinely', 'honestly', 'not gonna lie,', 'as an anarchist,',
  'reminder that', 'day 4 of the strike:', 'took direct action today,',
  'the state fears me,', 'dismantling capitalism one step at a time,', 'eat the rich but',
  'smashed the state today,', 'in these trying times i', 'quietly radical of me but i',
  'under late capitalism i', 'did my bit for the cause,', 'resisting as we speak,',
  'the struggle continues,', 'comrades, today i', 'small win for the movement,',
  'feeling revolutionary,', 'another day another act of resistance,', 'waging class war,',
  'anti-capitalist praxis update:', 'logged on to overthrow the state,',
  'spent my saturday radicalising,', 'big news for the resistance,', 'living my values,',
  'sticking it to the man,', 'fought the power today,', 'no war but class war, anyway i',
  'menace to society over here,', 'did an anarchism,', 'hot off the barricades:',
  'revolution status: ongoing,', 'abolish everything. also i', 'the people united etc,',
  'keeping the flame alive,', 'in a very radical mood so i', "capitalism won't know what hit it,",
  'seizing the day (and little else),', 'off-grid king behaviour,', 'stayed dangerous,',
  'you love to see it,', 'the vanguard (me)',
]

const acts = [
  'put my recycling in the wrong bin on purpose',
  'left a 1-star review for a Pret',
  "didn't say thank you to the bus driver (praxis)",
  'argued with a landlord in the YouTube comments for three hours',
  'unfollowed a centrist',
  'shoplifted a single grape to feel something',
  'signed a change.org petition and then had a lie down',
  'cancelled my gym membership to defund the fitness-industrial complex',
  "made a zine on my dad's printer",
  "shouted 'ACAB' at a PCSO who then waved and i waved back out of politeness",
  'started a mutual aid group chat that is just me and my flatmate',
  'boycotted a shop by forgetting it exists',
  'seized the means of production (i water the office plant now)',
  "wrote 'no gods no masters' in a library book in pencil",
  'keyed a car then apologised to the owner',
  'occupied the sofa',
  'returned my Amazon order to hurt Bezos',
  'jaywalked in full view of a police station',
  'downloaded a car',
  'tore down a poster then put it back because it was for a lost cat',
  "block-voted against the landlord in the residents' WhatsApp",
  "renamed the office wifi to 'property is theft'",
  'took an extra free sample at Costco (redistribution)',
  'left the trolley outside the bay to destabilise Tesco',
  'read half of a Graeber book',
  'added a book about the general strike to my basket',
  'muted a Tory on twitter, brutal stuff',
  'stopped using my full name on Deliveroo to go off-grid',
  'put googly eyes on a statue of a colonialist',
  "corrected someone's use of 'literally communist' in the comments",
  'unionised the group project',
  'brought my own cup to Starbucks to bankrupt them',
  'refused to give my email at the till',
  'took the little pen from the bank',
  'walked past a branch of Barclays disapprovingly',
  'reported a billionaire tweet',
  'recycled a Coca-Cola can extremely aggressively',
  'did a wheelie past the town hall',
  "wrote a strongly worded email to my MP and then didn't send it",
  'stood up on the bus for someone (mutual aid)',
  'let a car merge, redistributing road capital',
  'quoted Kropotkin in the comments of a dog video',
  'started composting to overthrow agribusiness',
  'wore a Che t-shirt from Vinted',
  "clapped when the film villain said 'the system is rigged'",
  'left my Uber driver five stars and a manifesto',
  'declined the cookies on a website',
  'handed out a flyer to one person who was my mum',
  'put a sticker on a lamppost slightly crooked, chaos reigns',
  'refused to download the app for 10% off',
  'spat near a bank (not on it, near it)',
  'unplugged the office vending machine for four minutes',
  "wrote 'landlords 😡' on a receipt and binned it",
  'gave a busker £2 and called it wealth redistribution',
  'brought a tote bag to fight plastic and the ruling class',
  'left a hostile review on the council Facebook page',
  'held the lift for the delivery guy (solidarity)',
  "renamed my fantasy football team 'the proletariat'",
  'took a longer lunch to strike against my own employer (me)',
  'returned a shopping trolley without collecting the pound',
  'shared a leftist meme to my 43 followers',
  'downloaded a PDF of Das Kapital and never opened it',
  'put my phone on aeroplane mode to escape surveillance capitalism for the flight',
  'borrowed a book instead of buying it, take that Waterstones',
  'argued that the queue was a social construct',
  'left a passive-aggressive note in the communal kitchen re: the means of production',
  'wore all black to Sainsbury\u2019s',
  'read the terms and conditions then rejected them',
  'brought my own bags AND refused the loyalty card',
  'stared menacingly at a Deliveroo advert',
  "told the self-checkout it wasn't my boss",
  'took a sick day to recharge my revolutionary energy',
  'changed my ringtone to Bella Ciao',
  'left the group chat, then rejoined, then left again',
  'walked out of a meeting (it had already ended)',
  'turned off notifications for a news app to resist the media apparatus',
  'double-parked outside a Wetherspoons in defiance',
  'told the barista to keep the change (redistribution)',
  'skipped an ad instead of watching it, another blow to capital',
  'set my out-of-office to a quote about the workers',
  'gave a thumbs down to a corporation on the internet',
  'ate lunch away from my desk in open revolt',
  'let the parking meter run out on principle',
  'DoorDashed a single bottle of water because i could not be bothered',
  'ordered Uber Eats from the restaurant directly across the street',
  'complained the Deliveroo was 6 minutes late while decrying the gig economy',
  'one-starred a driver for the crimes of capitalism (somehow their fault)',
  'sent back a coffee for having the wrong oat milk',
  'got a burrito delivered to the pub i was already sitting outside',
  'left a bad tip, felt guilty, and then did not change it',
  'waited 40 minutes for a poke bowl and called it hardship',
  'demanded a refund because the ice cream arrived slightly melted (systemic)',
  'skipped cooking to protest domestic labour under capitalism (ordered in)',
  'emailed customer service in ALL CAPS about a late parcel',
  'cancelled a subscription then resubscribed for the free trial again',
  'left a scathing Google review of a cafe that spelled my name wrong',
]

const excuses = [
  "can't make the protest, mum needs the car back by 4",
  "would riot but it's raining",
  "can't smash the state on an empty stomach, ordering a Deliveroo",
  "the revolution starts monday, i've got plans this weekend",
  'solidarity forever (i have work in the morning though)',
  'was going to occupy the town hall but it shut at 5',
  "the barricades can wait, my show's on",
  "postponing the general strike, my back's playing up",
  "can't come to the demo, i'm dogsitting",
  "would seize the means but i'm quite tired",
  'the march clashes with my dentist appointment',
  "can't overthrow anything today, it's leg day",
  'storming parliament is off, replacement bus service',
  "would go full anarchist but my phone's on 4%",
  'revolution is cancelled, the group chat went quiet',
  "can't dismantle capitalism, i'm waiting in for a parcel",
  "the uprising is delayed, i can't find my other shoe",
  'would burn it all down but i just did my nails',
  "can't man the barricades, it's my turn to cook",
  "the strike is on hold, payday's not til friday",
  'would smash the state but the trains are cancelled anyway',
  "can't attend the occupation, i've got a haircut booked",
  "revolution postponed, someone's coming to read the meter",
  "can't riot tonight, i'm five episodes deep",
  'would go but the demo starts at 9am which is frankly fascist',
  "can't make it, my Deliveroo's 2 minutes away",
  'the vanguard is having a duvet day',
  "would rise up but i've committed to a lie-in",
  "can't overthrow the government, it's bin day and i can't miss it",
  "the class war can wait, i've got a headache",
  'would organise but the venue wants a deposit',
  'revolution is off, i double-booked with brunch',
  "would fight the power but i've got a group project due",
  'the insurrection is rescheduled, clashes with the football',
  "can't picket, i left my good coat at my ex's",
  'postponing radical action, i am saving my energy',
  "the barricade's a no, i can't get parking",
  'would occupy but check-out is at 11',
  'revolution delayed pending my amazon return',
  "can't do direct action today, i'm waiting on a text back",
  "would march but my legs are still sore from the last one (i didn't go)",
  "can't picket, it's too cold and i'm not built for this",
  'the demo is a maybe, depends on the weather and my mood',
  'would rise up but i just got comfy',
  "can't come, my Oyster's out of credit and that's basically state repression",
  "can't make the demo, i'm waiting on a DoorDash",
  "would riot but my Uber Eats says 'arriving soon'",
  "revolution's off, i'm on hold with customer service",
  "can't picket, the Deliveroo driver can't find my building",
  "would rise up but i'd lose my place in the returns queue",
]

const closers = [
  'the revolution is coming.',
  'power to the people.',
  'this is what praxis looks like.',
  'stay dangerous.',
  'no ethical consumption etc etc.',
  "we did it, we're so back.",
  'they hate to see it.',
  'smash the system 🖤',
  "anyway who's got venmo for the printer ink",
  'the state is quaking.',
  'one struggle, one fight.',
  'solidarity forever ✊',
  'read theory.',
  'acab and i mean it.',
  'the personal is political.',
  'little victories.',
  "they can't stop all of us.",
  'the future is ours.',
  'another brick out of the wall.',
  'capitalism in shambles rn.',
  'history will remember this.',
  'onwards to the barricades (tomorrow).',
  'the man is sweating.',
  'chip chip away.',
  'no masters no borders.',
  'this is how it starts.',
  'the people are waking up (there are 3 likes).',
  'viva la revolución 🌹',
  'the establishment trembles.',
  'we move.',
  'the workers will remember who watered the office plant.',
  'resistance is a lifestyle.',
  'another day, another dollar not given to Nestlé.',
  'the tide is turning (imperceptibly).',
  'hold the line (from home).',
  'rage against the machine (quietly).',
  'the movement grows.',
  "you can't arrest an idea (or me, i'm indoors).",
  'long live the resistance 🚩',
  "we are the ones we've been waiting for, unfortunately.",
  'get radicalised or get left behind.',
  'the seeds of revolution etc.',
  'keep fighting the good fight from the sofa.',
  'abolish everything except my group chat.',
]

// standalone one-liners — complete posts about credentials / self-image / hot takes
const standalones = [
  'the FBI has a file on me. it is a noise complaint.',
  "i've been called 'a bit much at parties' which in this economy is basically a political prisoner.",
  "they'll write songs about my tweets. short songs. that no one listens to.",
  'i contain multitudes and 43 followers.',
  'MI5 wishes they had my energy. and my follower count. which is 43.',
  "i'm not saying i'm the next Emma Goldman but we both had strong opinions and no plan.",
  'capitalism has met its match: a man with a group chat and a printer.',
  "i'm basically a threat to national security (i own a bike and a lot of opinions).",
  'the ruling class fears three things: unions, the guillotine, and my quote-tweets.',
  "history's greatest revolutionaries also had unread emails.",
  'when they teach this era in schools they will mention the day i muted a Tory.',
  "i'm radicalised, self-employed, and slightly behind on rent.",
  'the barricades will be catered, i have checked.',
  "i'd have been huge in 1968. i'd have gone to one march and then caught a cold.",
  'someone has to hold the establishment accountable and it might as well be me, from bed.',
  "yes i'm an anarchist. no i can't come out, it's cold.",
  "i'm not lazy, i'm conserving revolutionary momentum.",
  "they can take our lives but they'll never take our unlimited data (until the 3rd of the month).",
  "i've read the first chapter of enough books to overthrow any government.",
  'the workers control the means of production and i control the office thermostat.',
  'not all heroes wear capes. some of us wear a tote bag with a slogan on it.',
  "i put the 'anarchy' in 'i'll be there in spirit'.",
  'give me liberty or give me a lie-in, ideally the lie-in.',
  'the movement needs thinkers, not doers, and boy am i not a doer.',
  "i'm the reason landlords check their reviews and then feel briefly annoyed.",
  "the state can't cancel what it can't find, and i'm under a weighted blanket.",
  "i've achieved more from this sofa than the Paris Commune, spiritually.",
  'wanted by no authorities but feared by all group chats.',
  "the revolution will not be televised because i haven't left the house to film it.",
  "call me a keyboard warrior one more time. i dare you. i'll reply.",
  'controversial but the real revolution is not replying to emails.',
  'unpopular opinion: capitalism bad. i said it. someone had to.',
  'hot take: if you think about it, being tired is a form of resistance.',
  'genuinely believe my refusal to get out of bed is destabilising the economy.',
  'society would collapse without me and honestly, good.',
  'the most radical thing you can do under capitalism is take a really long nap.',
  'we should abolish work. starting with mine. today. this afternoon ideally.',
  'billionaires should not exist and neither should mondays.',
  'the fact that i need a job to afford rent is, if you think about it, fascism.',
  'i am the resistance and the resistance is having a quiet one tonight.',
  'the gig economy is exploitative and also where is my food, it has been eleven minutes.',
  'just saw the DoorDash service fee and honestly THIS is why we need a revolution.',
  'solidarity with all workers except the one who forgot my dip.',
  'hot take: having to load the dishwasher is a form of oppression.',
  'capitalism is when my phone hits 20% before 3pm.',
  'the barista spelled my name wrong. anyway. eat the rich.',
  'wild that in 2026 i still have to walk to the fridge myself.',
  'the wifi buffered during my show and i have never felt closer to the working class.',
  'unbelievable that i pay taxes AND my avocado was not ripe.',
  'they keep us divided so we do not unite against the £4.99 delivery fee.',
  'the real class struggle is my Amazon parcel being left with a neighbour.',
  'why should i cook when someone else can cook and i can simply complain about it.',
  'surviving late capitalism means my oat latte was lukewarm again today.',
  'first they came for the free returns, and i said absolutely not.',
  'controversial: if my coffee order is complicated, that is the system\u2019s fault, not mine.',
  'unpopular opinion: waiting is violence.',
  'airline food is a human rights issue and i will die on this hill (in premium economy).',
  'the most oppressed group is people whose food arrives cold. i said what i said.',
  'genuinely think "the customer is always right" should extend to me being right about everything.',
  'solidarity forever, but this Deliveroo driver went to the wrong flat.',
  'i would smash the state but i just remembered i left a review unwritten.',
  'do you know how HARD it is to be radical when the self-checkout keeps saying unexpected item.',
]

// ---------------------------------------------------------------------------
// generator
// ---------------------------------------------------------------------------

const pick = (a) => a[Math.floor(Math.random() * a.length)]
const chance = (p) => Math.random() < p

function pickDistinct(a) {
  const x = pick(a)
  let y = pick(a)
  let guard = 0
  while (y === x && guard++ < 10) y = pick(a)
  return [x, y]
}

function generate() {
  const r = Math.random()
  let body
  if (r < 0.34) {
    body = `${pick(openers)} ${pick(acts)}. ${pick(closers)}`
  } else if (r < 0.54) {
    const [a, b] = pickDistinct(acts)
    body = `${pick(openers)} ${a} and ${b}. ${pick(closers)}`
  } else if (r < 0.74) {
    body = `${pick(excuses)}. ${pick(closers)}`
  } else if (r < 0.90) {
    // standalone, occasionally with a closer tacked on
    body = chance(0.4) ? `${pick(standalones)} ${pick(closers)}` : pick(standalones)
  } else {
    // opener straight into a standalone-ish beat for extra shape
    body = `${pick(openers)} ${pick(acts)}. ${pick(excuses)}. ${pick(closers)}`
  }
  return body.charAt(0).toLowerCase() + body.slice(1)
}

// bluesky posts cap at 300 graphemes; keep well under and regenerate if too long
const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
const graphemeLen = (s) => [...seg.segment(s)].length

function generateSafe(limit = 280) {
  for (let i = 0; i < 30; i++) {
    const t = generate()
    if (graphemeLen(t) <= limit) return t
  }
  return generate().slice(0, limit)
}

// rough size of the generation space (upper bound, before de-dupe)
function spaceSize() {
  const O = openers.length, A = acts.length, E = excuses.length,
        C = closers.length, S = standalones.length
  const p1 = O * A * C
  const p2 = O * A * (A - 1) * C
  const p3 = E * C
  const p4 = S + S * C
  const p5 = O * A * E * C
  return { O, A, E, C, S, total: p1 + p2 + p3 + p4 + p5 }
}

// ---------------------------------------------------------------------------
// posting
// ---------------------------------------------------------------------------

function requireEnv(name) {
  const v = process.env[name]
  if (!v) {
    console.error(`missing required env var: ${name}`)
    process.exit(1)
  }
  return v
}

async function makeAgent() {
  const agent = new AtpAgent({ service: process.env.BLUESKY_SERVICE || 'https://bsky.social' })
  await agent.login({
    identifier: requireEnv('BLUESKY_HANDLE'),
    password: requireEnv('BLUESKY_APP_PASSWORD'),
  })
  return agent
}

async function postOnce(agent) {
  const text = generateSafe()
  const rt = new RichText({ text })
  await rt.detectFacets(agent)
  const res = await agent.post({
    text: rt.text,
    facets: rt.facets,
    createdAt: new Date().toISOString(),
  })
  console.log(`[${new Date().toISOString()}] posted: ${text}`)
  console.log(`  uri: ${res.uri}`)
  return res
}

// ---------------------------------------------------------------------------
// entrypoint
// ---------------------------------------------------------------------------

const args = new Set(process.argv.slice(2))

async function main() {
  if (args.has('--count')) {
    const s = spaceSize()
    console.log(`banks: ${s.O} openers, ${s.A} acts, ${s.E} excuses, ${s.C} closers, ${s.S} standalones`)
    console.log(`approx unique posts: ${s.total.toLocaleString()}`)
    return
  }

  if (args.has('--sample')) {
    for (let i = 0; i < 20; i++) console.log('•', generateSafe())
    return
  }

  if (args.has('--dry')) {
    console.log(generateSafe())
    return
  }

  const agent = await makeAgent()

  if (args.has('--loop')) {
    const mins = Number(process.env.POST_INTERVAL_MINUTES) || 240
    console.log(`loop mode: posting every ${mins} min`)
    await postOnce(agent)
    setInterval(() => {
      postOnce(agent).catch((e) => console.error('post failed:', e.message))
    }, mins * 60 * 1000)
  } else {
    await postOnce(agent)
  }
}

main().catch((e) => {
  console.error('fatal:', e.message)
  process.exit(1)
})
