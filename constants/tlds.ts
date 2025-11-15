// A curated list of popular and interesting TLDs.
// Sourced from various lists of common TLDs available for public registration.
export const ALL_TLDS: string[] = [
  // Popular Generic
  '.com', '.net', '.org', '.info', '.biz', '.io', '.co', '.app', '.dev',

  // Tech & Startups
  '.ai', '.tech', '.software', '.cloud', '.digital', '.systems', '.data', '.online',
  '.site', '.website', '.space', '.pro', '.xyz', '.link', '.click', '.dev',
  '.codes', '.tools', '.build', '.network',

  // Business & Finance
  '.company', '.business', '.inc', '.llc', '.ltd', '.financial', '.finance', '.money',
  '.capital', '.investments', '.holdings', '.ventures', '.marketing', '.solutions',
  '.services', '.exchange', '.trading',

  // E-commerce & Retail
  '.store', '.shop', '.shopping', '.sale', '.deals', '.market', '.boutique', '.style',
  '.fashion', '.clothing', '.shoes', '.jewelry', '.gifts', '.blackfriday',

  // Creative & Media
  '.art', '.design', '.studio', '.media', '.graphics', '.gallery', '.photo', '.photography',
  '.pics', '.pictures', '.audio', '.video', '.film', '.show', '.tv', '.actor',
  '.agency', '.press', '.news', '.blog', '.social', '.live',

  // Lifestyle & Community
  '.life', '.style', '.world', '.community', '.group', '.club', '.family', '.fun',
  '.cool', '.zone', '.today', '.expert', '.guru', '.ninja', '.monster',

  // Food & Drink
  '.cafe', '.bar', '.pub', '.restaurant', '.pizza', '.kitchen', '.recipes', '.coffee',
  '.menu', '.wine', '.beer',

  // Health & Fitness
  '.health', '.healthcare', '.care', '.clinic', '.dental', '.hospital', '.medical',
  '.fit', '.fitness', '.yoga', '.diet',

  // Real Estate & Home
  '.house', '.home', '.homes', '.estate', '.properties', '.property', '.realty', '.apartments',
  '.rent', '.lease', '.forsale',

  // Travel & Transport
  '.travel', '.tours', '.holiday', '.vacations', '.flights', '.taxi', '.limo', '.car', '.cars',

  // Education & Professional
  '.edu', '.academy', '.college', '.university', '.school', '.study', '.courses', '.institute',
  '.foundation', '.org', '.ong',

  // Geographic (examples)
  '.nyc', '.london', '.paris', '.tokyo', '.berlin', '.us', '.uk', '.ca', '.de', '.fr', '.se',

  // Other Interesting/Modern TLDs
  '.aero', '.asia', '.bet', '.bio', '.blue', '.cat', '.ceo', '.charity', '.chat', '.church',
  '.city', '.computer', '.consulting', '.contact', '.contractors', '.cool', '.credit',
  '.creditcard', '.cricket', '.dance', '.date', '.delivery', '.democrat', '.diamonds',
  '.directory', '.doctor', '.dog', '.domains', '.earth', '.email', '.energy', '.engineer',
  '.enterprises', '.equipment', '.events', '.exchange', '.fail', '.farm', '.fashion',
  '.fish', '.florist', '.football', '.fyi', '.games', '.garden', '.glass', '.global',
  '.gold', '.golf', '.guide', '.guitars', '.hockey', '.hosting', '.how', '.immo',
  '.industries', '.ink', '.international', '.jetzt', '.jobs', '.land', '.lawyer', '.legal',
  '.lighting', '.loan', '.loans', '.lol', '.luxe', '.maison', '.management', '.map',
  '.memorial', '.men', '.menu', '.moda', '.mom', '.mortgage', '.movie', '.museum',
  '.music', '.one', '.onl', '.page', '.partners', '.parts', '.party', '.pet', '.phone',
  '.place', '.plumbing', '.plus', '.poker', '.porn', '.productions', '.promo', '.pub',
  '.red', '.rehab', '.report', '.republican', '.rest', '.review', '.reviews', '.rip',
  '.rocks', '.run', '.save', '.science', '.security', '.sexy', '.shiksha', '.singles',
  '.soccer', '.solar', '.surf', '.surgery', '.tax', '.tattoo', '.team', '.theater', '.tips',
  '.tires', '.tours', '.town', '.toys', '.trade', '.training', '.tube', '.vet', '.viajes',
  '.villas', '.vision', '.vote', '.voyage', '.watch', '.webcam', '.wiki', '.win', '.work',
  '.works', '.wtf', '.zone'
// FIX: Added explicit types to filter callback to prevent type inference issues, which was causing the error in TldSettingsModal.tsx.
].filter((tld: string, index: number, self: readonly string[]) => self.indexOf(tld) === index && tld.startsWith('.')).sort();