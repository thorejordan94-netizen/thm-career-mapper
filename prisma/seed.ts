import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// All 960 TryHackMe room slugs from specification
const ROOM_SLUGS = [
  '0day', '0x41haz', 'a-bucket-of-phish', 'abusing-windows-internals', 'active-directory-basics',
  'active-directory-hardening', 'active-reconnaissance', 'ad-authenticated-enumeration', 'ad-badsuccessor',
  'ad-basic-enumeration', 'ad-certificate-templates', 'ad-tier-model', 'advanced-elk-queries',
  'advanced-sql-injection', 'advanced-static-analysis', 'advent-of-cyber-1-2019', 'advent-of-cyber-2-2020',
  'advent-of-cyber-2022', 'advent-of-cyber-2023', 'advent-of-cyber-2024', 'advent-of-cyber-23-side-quest',
  'advent-of-cyber-24-side-quest', 'advent-of-cyber-3-2021', 'adventure-time', 'agent-sudo', 'agent-t',
  'ai-forensics', 'ai-ml-security-threats', 'airplane', 'alfred', 'all-in-one', 'allsignspoint2pwnage',
  'analysing-volatile-memory', 'android-analysis', 'android-hacking-101', 'android-malware-analysis',
  'annie', 'anonforce', 'anonymous', 'anonymous-playground', 'anthem', 'anti-reverse-engineering',
  'apiwizards-breach', 'apt28-in-the-snare', 'apt28-inception-theory', 'aratus', 'archangel', 'aster',
  'athena', 'atlas', 'atlassian-cve-2022-26134', 'atomic-bird-goes-purple-1', 'atomic-bird-goes-purple-2',
  'atomic-red-team', 'attack-surface-reduction', 'attackerkb', 'attacking-ecb-oracles', 'attacking-ics-plant-1',
  'attacking-ics-plant-2', 'attacking-kerberos', 'attacking-llms', 'auditing-and-monitoring', 'autopsy',
  'av-evasion-shellcode', 'aware-online-banking', 'azure-infrastructure-recon', 'azure-network-recon',
  'baby-encryption', 'backtrack', 'badbyte', 'baron-samedit', 'basic-dynamic-analysis', 'basic-malware-re',
  'basic-pentesting', 'basic-static-analysis', 'berlin', 'biblioteca', 'biohazard', 'blizzard', 'block',
  'blog', 'blue', 'blueprint', 'boiler-ctf', 'bolt', 'boogeyman-1', 'boogeyman-2', 'boogeyman-3',
  'bookstore', 'borderlands', 'bounty-hacker', 'brainpan-1', 'brains', 'brainstorm', 'breaching-active-directory',
  'break-it', 'break-out-the-cage', 'breaking-crypto-the-simple-way', 'breaking-rsa', 'breakme', 'brim',
  'broker', 'brooklyn-nine-nine', 'brute', 'brute-force-heroes', 'brute-it', 'buffer-overflow-prep',
  'buffer-overflows', 'bugged', 'burg3r', 'burp-suite-extensions', 'burp-suite-intruder', 'burp-suite-other-modules',
  'burp-suite-repeater', 'burp-suite-the-basics', 'c4ptur3-th3-fl4g', 'cache-me-outside', 'cactus',
  'calculated', 'capture', 'carnage', 'cat-pictures', 'cat-pictures-2', 'cc-ghidra', 'cc-pen-testing',
  'cc-radare2', 'cc-steganography', 'cherryblossom', 'chocolate-factory', 'chronicle', 'ci-cd-and-build-security',
  'cisco-ios-vulnerabilities', 'city-invasion', 'clicker', 'cmess', 'coldbox-easy', 'colddbox-easy',
  'color-flood', 'command-injection', 'common-attacks', 'common-linux-privesc', 'complete-beginner',
  'connect', 'containers', 'content-discovery', 'converted', 'convertmyvideo', 'cooctus-stories',
  'core-windows-processes', 'corp', 'corridor', 'couch', 'crack-the-hash', 'crack-the-hash-level-2',
  'creative', 'credentials-harvesting', 'critical', 'crocc-crew', 'crylo', 'crypto-failures',
  'cryptography-basics', 'cryptography-for-dummies', 'cryptosystem', 'csrf', 'ctf-collection-vol-1',
  'ctf-collection-vol-2', 'ctf-collection-vol-3', 'custom-alert-rules', 'custom-alert-rules-in-wazuh',
  'custom-tooling-using-burp', 'custom-tooling-using-python', 'cve-2021-41773-42013', 'cve-2022-26923',
  'cve-2023-38408', 'cve-2023-38831', 'cve-2024-6387', 'cyber-crisis-management', 'cyber-defense-frameworks',
  'cyber-heroes', 'cyber-kill-chain', 'cyber-scotland-2021', 'cyber-threat-intelligence', 'cyberchef-the-basics',
  'cybercrafted', 'cyberdefenders-acoustic', 'cyberdefenders-africanfalls', 'cyberdefenders-packetmaze',
  'cyberheroes', 'cyberlens', 'cyberseclabs-bravery', 'cyborg', 'daily-bugle', 'darkmatter', 'dast',
  'data-exfiltration', 'database-vulnerabilities', 'dav', 'ddos', 'ddos-attacks', 'debug', 'debugging-with-gdb',
  'defacing', 'defender-intro', 'defensive-security', 'defensive-security-intro', 'delayed',
  'deploying-active-directory', 'deploying-and-integrating-suricata-ids', 'des-exploit-tron',
  'detection-engineering', 'devel', 'devsecops', 'devsecops-culture', 'diamond-model', 'dirty-pipe-cve-2022-0847',
  'disgruntled', 'dns-in-detail', 'dns-manipulation', 'docker-for-pentesters', 'docker-rodeo', 'dreaming',
  'drupal-cve-2018-7600', 'dx1-liberty-island', 'dx2-hell-s-kitchen', 'easy-peasy', 'eboot2root', 'edr',
  'elastic-stack-integration', 'elevation-of-privileges', 'elf-basics', 'elk', 'email-analysis', 'emote',
  'empire', 'encryption-crypto-101', 'endpoint-security-monitoring', 'enpass', 'enumeration', 'epoch',
  'etch', 'event-management', 'eviction', 'exam-room', 'exfilnode', 'expediting-registry-analysis',
  'exploit-vulnerabilities', 'exploiting-active-directory', 'expose', 'ext-analysis', 'extending-your-network',
  'extracted', 'fat32-analysis', 'ffuf', 'file-carving', 'file-inclusion', 'file-upload-vulnerabilities',
  'firewall-fundamentals', 'firewalls', 'fixit', 'flag-vault', 'flag-vault-2', 'flarevm-arsenal-of-tools',
  'flatline', 'flip', 'follina-msdt', 'follow-the-path', 'for-business-reasons', 'forensic-imaging',
  'forensics', 'forgotten-implant', 'fortress', 'fowsniff-ctf', 'frank-and-herby-make-an-appointment',
  'frank-and-herby-try-again', 'frank-herby-make-an-app', 'friday-overtime', 'frosteau-busy-with-vim',
  'fusion-corp', 'gallery', 'game-zone', 'gamebuzz', 'gaming-server', 'gamingserver', 'gatekeeper',
  'gccctf', 'geoguessr', 'geolocating-images', 'get-ahead', 'getting-started', 'git-and-crumpets',
  'git-happens', 'githappens', 'gitlab-cve-2021-22205', 'glass', 'glitch', 'global-command-and-control',
  'goldeneye', 'google-dorking', 'gotta-catch-em-all', 'gpu-cracking', 'gquic-protocol', 'graphql',
  'greenflare', 'grep', 'h4cked', 'hack-back', 'hacker-vs-hacker', 'hacking-with-powershell', 'hackpark',
  'hammer', 'hard-pill', 'harder', 'haskhell', 'heartbleed', 'hello-world', 'hex', 'hiddeninplainsight',
  'hill-cipher', 'holo', 'homeles', 'hopper-s-roppers-badge', 'horizontal-privilege-escalation',
  'how-to-use-tryhackme', 'how-web-applications-work', 'htb-ctf', 'http-in-detail', 'http-request-smuggling',
  'http2-explained', 'https-in-detail', 'hydraswoops', 'ice', 'ics-firmware-security',
  'identity-and-access-management', 'ignite', 'imbalanced-data', 'immunity-debugger', 'immunity-tutorial',
  'impacket-tutorial', 'impact', 'incident-handling-with-splunk', 'incident-response-foundations',
  'incident-response-prep', 'inclusion', 'industrial-intrusion', 'inferno', 'infinity-shell', 'injectics',
  'insecure-deserialisation', 'insecure-randomness', 'insekube', 'intermediate-nmap', 'internal', 'intranet',
  'intro-poc-scripting', 'intro-to-c2', 'intro-to-cloud-security', 'intro-to-cold-system-forensics',
  'intro-to-containerisation', 'intro-to-cross-site-scripting', 'intro-to-cyber-threat-intel',
  'intro-to-defensive-security', 'intro-to-detection-engineering', 'intro-to-digital-forensics',
  'intro-to-docker', 'intro-to-endpoint-security', 'intro-to-graphql-hacking', 'intro-to-iac',
  'intro-to-iot-pentesting', 'intro-to-ir-and-im', 'intro-to-kubernetes', 'intro-to-lan',
  'intro-to-log-analysis', 'intro-to-logs', 'intro-to-malware-analysis', 'intro-to-offensive-security',
  'intro-to-pipeline-automation', 'intro-to-pwntools', 'intro-to-ssrf', 'intro-to-threat-emulation',
  'introduction-to-antivirus', 'introduction-to-cryptography', 'introduction-to-cryptops',
  'introduction-to-devsecops', 'introduction-to-django', 'introduction-to-flask', 'introduction-to-linux',
  'introductory-networking', 'introductory-researching', 'intrusion-detection', 'investigating-windows',
  'investigating-windows-2-0', 'investigating-windows-3-x', 'investigating-with-elk-101',
  'investigating-with-splunk', 'ir-timeline-analysis', 'ironcorp', 'irse', 'island-orchestration',
  'jack', 'jack-of-all-trades', 'james-bond-room-1', 'jason', 'java-deserialization', 'java-ssti',
  'jis-ctf-vulnupload', 'john-hammond-junior', 'jokerctf', 'jsonwebtoken', 'juice-shop', 'juicy-details',
  'k-9', 'katana', 'kerberos', 'kessel-run', 'key-management', 'keybored', 'keyring', 'killshot',
  'kim-s-crew', 'king-of-the-hill', 'kitchen', 'koth-hackers', 'kubernetes-for-everyone', 'kylebot',
  'la-casa-de-papel', 'lab', 'lan-threat-simulation', 'lazyadmin', 'learning-malware-analysis',
  'learning-the-ropes', 'ledger', 'legal-considerations-in-dfir', 'length-extension-attacks',
  'lesson-learned', 'lessons-learned', 'lian-yu', 'library', 'light', 'linux-agency', 'linux-backdoors',
  'linux-file-system-analysis', 'linux-forensics', 'linux-function-hooking', 'linux-fundamentals-part-1',
  'linux-fundamentals-part-2', 'linux-fundamentals-part-3', 'linux-incident-surface', 'linux-live-analysis',
  'linux-logs-investigations', 'linux-memory-analysis', 'linux-modules', 'linux-privesc', 'linux-privesc-arena',
  'linux-privilege-escalation', 'linux-process-analysis', 'linux-reverse-engineering', 'linux-rootkits',
  'linux-server-forensics', 'linux-shells', 'linux-strength-training', 'linux-system-hardening',
  'linux-wireshark-traffic-analysis', 'living-off-the-land', 'lnx', 'lo-fi', 'local-file-inclusion',
  'local-file-inclusion-advanced', 'localpotato', 'lockdown', 'log-analysis', 'log-operations',
  'log-universe', 'logging-for-accountability', 'logless-hunt', 'logs-fundamentals',
  'logstash-data-processing-unit', 'lookback', 'looking-glass', 'madness', 'mal-malware-introductory',
  'mal-researching', 'mal-strings', 'malbuster', 'maldocs', 'malware-analysis-module',
  'malware-sandbox-evasion', 'malware-sandboxes', 'manhattan', 'markdown-to-pdf-converter', 'marketplace',
  'master', 'meltdown-explained', 'memory-forensics', 'metasploit-exploitation', 'metasploit-introduction',
  'metasploit-meterpreter', 'meteoroid', 'meterpreter', 'mindgames', 'minotaur-s-labyrinth',
  'misguided-ghosts', 'miskatonic-university', 'misp', 'mission-impossible', 'mitre-att-ck-framework',
  'mnemonic', 'mobile-malware-analysis', 'monitor', 'moria', 'mothersecret', 'mr-phisher', 'mrrobot',
  'multi-factor-authentication', 'multimedia', 'mustacchio', 'nahamcon-ctf', 'nahamstore', 'napping',
  'neighbour', 'nessus', 'net-sec-challenge', 'netfilter', 'netsec-playground', 'netwars',
  'network-device-hardening', 'network-exploitation', 'network-file-shares', 'network-fundamentals',
  'network-miner', 'network-security', 'network-security-protocols', 'network-security-solutions',
  'network-services', 'network-services-2', 'networking-concepts', 'networking-core-protocols',
  'networking-essentials', 'networking-secure-protocols', 'networkminer', 'new-hire-old-artifacts',
  'new-york-flankees', 'next-js-cve-2025-29927', 'nice-try', 'nikto', 'ninja-skills', 'nis-linux-part-i',
  'nmap', 'nmap-advanced-port-scans', 'nmap-basic-port-scans', 'nmap-live-host-discovery',
  'nmap-post-port-scans', 'nmap-the-basics', 'nonamectf', 'normal-https-example-com',
  'nosql-injection-basics', 'nosqlinjection', 'ntfs-analysis', 'oauth-vulnerabilities',
  'obfuscation-principles', 'obscure', 'offensive-pentesting', 'offensive-security-intro',
  'oh-my-webserver', 'ohsint', 'ollie', 'olympus', 'on-premises-iac', 'one-piece', 'opacity', 'opencti',
  'openvas', 'openvpn', 'operating-system-security', 'oracle-9', 'osi-model', 'osint', 'overpass',
  'overpass-2-hacked', 'overpass-3-hosting', 'owasp-api-security-top-10', 'owasp-broken-access-control',
  'owasp-juice-shop', 'owasp-top-10', 'owasp-top-10-2021', 'packet-analysis', 'packets-frames',
  'palsforlife', 'passive-reconnaissance', 'password-attacks', 'password-cracking', 'password-resetter',
  'passwords', 'paul-hunt', 'pentest-bookmarks', 'pentesting-fundamentals', 'persistence', 'phishing',
  'phishing-analysis-fundamentals', 'phishing-emails-in-action', 'phishingroom', 'physical-security',
  'pickle-rick', 'plotted', 'post-exploitation-basics', 'post-exploitation-frameworks',
  'powershell-for-pentesters', 'powerview', 'practical-ethical-hacking', 'pre-security',
  'principles-of-security', 'print-nightmare', 'printer-hacking-101', 'printnightmare-again', 'privesc',
  'privesccheck', 'privilege-escalation', 'probe', 'producer', 'programming-fundamentals', 'proshop',
  'prospect', 'protocols-and-servers', 'protocols-and-servers-2', 'ps-eclipse', 'ps-empire', 'psycho-break',
  'public-key-cryptography', 'publish', 'purple-team', 'purple-team-fundamentals', 'put-on-the-glasses',
  'putting-it-all-together', 'puzzle', 'pwn101', 'pwned', 'pwning-wordpress', 'pwnkit-cve-2021-4034',
  'pwnme', 'pylon', 'pyramid-of-pain', 'pyrat', 'python-basics', 'python-for-pentesters', 'python-playground',
  'query', 'ra', 'ra-2', 'rabbit-hole', 'rabbit-store', 'race-conditions', 'race-conditions-challenge',
  'racetrack-bank', 'razorblack', 'recovering-active-directory', 'recovery', 'red', 'red-stone-one-carat',
  'red-team-engagements', 'red-team-fundamentals', 'red-team-opsec', 'red-team-recon', 'red-team-threat-intel',
  'redline', 'registry-persistence-detection', 'regular-expressions', 'relevant', 'reloaded',
  'remnux-getting-started', 'remux-the-tmux', 'request-smuggling-websockets', 'reset', 'ret2libc',
  'retracted', 'retro', 'revenge', 'reversing-elf', 'revil-corp', 'rfc', 'road', 'rogue', 'rootme',
  'rop-emporium', 'rop-primer', 'router', 'rpburpsuite', 'rpnessus', 'rpthreathunting', 'rpwebapp',
  'rpwebscanning', 'rrootme', 'rsmtp', 'rtfm', 'rtp', 'run', 'rust', 'rust-scanning', 'sacra', 'safezone',
  'sage', 'sakura-room', 'sans-holiday-hack-challenge', 'sast', 'sburger', 'scaling-up',
  'scanning-and-enumeration', 'scripting', 'scsm', 'search-skills', 'searchlight-imint', 'seaside-surfing',
  'secure-software-development', 'securesolaireyou', 'security-awareness', 'security-engineer-intro',
  'security-operations', 'security-principles', 'seekr', 'seh-overflow', 'server-side-template-injection',
  'serverless', 'services', 'shell-commands', 'shell-scripting', 'shodan-io', 'simple-ctf', 'skynet',
  'smag-grotto', 'smaggrotto', 'smtp-misconfigurations', 'snort', 'snort-challenge-live-attacks',
  'snort-challenge-the-basics', 'soc-analysis', 'soc-automation', 'soc-fundamentals', 'soc-level-1',
  'soc-workbooks-and-lookups', 'solar', 'source', 'source-code-security', 'splunk-2', 'splunk-3',
  'splunk-basics', 'splunk-dashboards-and-reports', 'splunk-data-manipulation', 'splunk-exploring-spl',
  'splunk-setting-up-a-soc-lab', 'spring', 'spring4shell-cve-2022-22965', 'sqhell', 'sql-fundamentals',
  'sql-injection', 'sql-injection-lab', 'sqlmap', 'sqlmap-the-basics', 'squid-game', 'ssdlc', 'ssrf',
  'ssti', 'starting-out-in-cyber-sec', 'startup', 'stealth', 'steel-mountain', 'stuxctf',
  'subdomain-enumeration', 'sudo-buffer-overflow', 'sudo-security-bypass', 'summit', 'super-secret-tip',
  'super-spam', 'supplemental-memory', 'supply-chain-attack-lottie', 'surfer', 'sustah', 'sweettooth-inc',
  'symfony', 'sysinternals', 'system-security', 't-pot', 'take-flights', 'tardigrade', 'task-scheduler',
  'tbhh', 'tcp-ip', 'team', 'techsupp0rt-1', 'tempest', 'terminal', 'terraform', 'the-blob-blog',
  'the-cod-caper', 'the-docker-rodeo', 'the-find-command', 'the-great-escape', 'the-hacker-methodology',
  'the-impossible-challenge', 'the-lay-of-the-land', 'the-london-bridge', 'the-marketplace',
  'the-server-from-hell', 'the-sticker-shop', 'the-world', 'theatre', 'thompson', 'threat-hunting-foothold',
  'threat-hunting-pivoting', 'threat-hunting-ransomware', 'threat-intelligence-tools', 'threat-modeling',
  'throwback', 'tomghost', 'tony-the-tiger', 'toolbox-vim', 'tor', 'toronto', 'tpot', 'trace',
  'traffic-analysis-essentials', 'trap', 'tre', 'tryhack3m-0day', 'tryhack3m-advent-of-cyber-side-quest',
  'tryhack3m-bah-humbug', 'tryhack3m-biohazard', 'tryhack3m-boss-of-the-soc-v2', 'tryhack3m-cherry-blossom',
  'tryhack3m-cyber-siege', 'tryhack3m-elf-minder-9000', 'tryhack3m-evergreen', 'tryhack3m-ghost-town',
  'tryhack3m-ide', 'tryhack3m-kibana', 'tryhack3m-literary-hacking', 'tryhack3m-network-forensics',
  'tryhack3m-sch3ma-d3mon', 'tryhack3m-subscribe', 'tryhack3m-tricipher-summit', 'trypwnme-one',
  'trypwnme-two', 'trywinme-think-cyber-monopoly', 'tshark', 'tshark-challenge-i-teamwork',
  'tshark-challenge-ii-directory', 'tshark-cli-wireshark-features', 'tshark-the-basics', 'tutorial',
  'u-a-high-school', 'ultratech', 'umbrella', 'unattended', 'unbaked-pie', 'unified-kill-chain',
  'unstable-twin', 'upload-vulnerabilities', 'uranium-ctf', 'valley', 'velociraptor',
  'virtualization-and-containers', 'void-execution', 'volatility', 'volatility-essentials', 'volt-typhoon',
  'vpn-basics', 'vulnerabilities-101', 'vulnerability-capstone', 'vulnerability-management',
  'vulnerability-research', 'vulnerability-scanner-overview', 'vulnnet', 'vulnnet-active', 'vulnnet-dotjar',
  'vulnnet-dotpy', 'vulnnet-endgame', 'vulnnet-internal', 'vulnnet-node', 'vulnnet-roasted', 'vulnserver',
  'vulnuniversity', 'vulnvault', 'vulnversity', 'w1seguy', 'w3bsploit', 'waf-bypass', 'walking-an-application',
  'wallet', 'wargames', 'warzone-1', 'warzone-2', 'watcher', 'wazuh', 'we-are-groot', 'web-app-security',
  'web-application-firewall', 'web-enumeration', 'web-fundamentals', 'web-osint', 'web-scanning',
  'webapp-security', 'webgym', 'webhook-security', 'webshell', 'wekor', 'wgel-ctf', 'what-is-networking',
  'what-the-shell', 'wifi-hacking-101', 'windows-api', 'windows-event-logs', 'windows-exploitation',
  'windows-forensics', 'windows-fundamentals-1', 'windows-fundamentals-2', 'windows-fundamentals-3',
  'windows-internals', 'windows-local-persistence', 'windows-persistence', 'windows-privesc',
  'windows-privesc-arena', 'windows-privilege-escalation', 'windows-reverse-shell',
  'windows-system-administration', 'wireless-hacking-101', 'wireshark-101', 'wireshark-packet-operations',
  'wireshark-the-basics', 'wireshark-traffic-analysis', 'wonderland', 'wordlist-generation',
  'wordpress-cve-2021-29447', 'world-wide-web', 'worm-propagation', 'wrath', 'writeups',
  'writing-pentest-reports', 'wwbuddy', 'x86-architecture-overview', 'x86-assembly-crash-course',
  'xdr-introduction', 'xss', 'xxe-injection', 'yara', 'year-of-the-dog', 'year-of-the-dog-2',
  'year-of-the-fox', 'year-of-the-jellyfish', 'year-of-the-owl', 'year-of-the-pig', 'year-of-the-rabbit',
  'you-got-mail', 'you-re-in-a-cave', 'zeek', 'zeek-exercises', 'zeno', 'zero-logon'
];

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'admin123',
    10
  );

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@example.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`✅ Created admin user: ${admin.email}`);

  // Seed all 960 rooms
  console.log(`🏠 Seeding ${ROOM_SLUGS.length} rooms...`);
  
  let created = 0;
  let skipped = 0;

  for (const slug of ROOM_SLUGS) {
    const existing = await prisma.room.findUnique({ where: { slug } });
    
    if (!existing) {
      await prisma.room.create({
        data: {
          slug,
          url: `https://tryhackme.com/room/${slug}`,
          scrapeStatus: 'PENDING',
        },
      });
      created++;
    } else {
      skipped++;
    }
  }

  console.log(`✅ Created ${created} rooms, skipped ${skipped} existing rooms`);
  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
