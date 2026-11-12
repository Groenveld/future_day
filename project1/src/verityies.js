// All the Verity'ies and their WikiVerity articles.
// Change the texts here! Every article has:
//   intro     - the first paragraph at the top
//   infobox   - the fact box on the right
//   sections  - headings with paragraphs (and an optional list)
// The "scary" part is the transformed form that appears after the secret.

export const verityies = [
  {
    name: 'Verity',
    color: '#ffd23f',
    face: 'happy',
    size: 140,
    objectID: 0,
    infobox: {
      Color: 'Yellow',
      Shape: 'Perfectly round',
      Role: 'Leader of the Verity’ies',
      'Known for': 'Always telling the truth',
      'Best friend': 'Hapity',
      Catchphrase: '“That’s just the truth!”',
    },
    intro:
      'Verity is a yellow ball and the leader and founder of the group known as the Verity’ies. He is best known for always telling the truth, no matter what. The whole group is named after him, and most of the other Verity’ies first met because of him.',
    sections: [
      {
        title: 'Appearance',
        paragraphs: [
          'Verity is bright yellow, like the sun, and has a friendly smile and two round black eyes. He has a small shiny spot on the top left of his head, which he says comes from “thinking too hard about the truth”.',
          'He is a little bigger than most of the other Verity’ies, but much smaller than Obesity.',
        ],
      },
      {
        title: 'Personality',
        paragraphs: [
          'Verity is honest, calm and fair. When the other Verity’ies have an argument, they roll over to Verity, because everybody knows he will say what really happened. This has made him the unofficial judge of the group.',
          'His honesty sometimes gets him into trouble. When Moggity once asked if his new hair looked good, Verity said it looked “like a squashed bird’s nest”. Moggity did not talk to him for three days.',
        ],
      },
      {
        title: 'History',
        paragraphs: [
          'Verity was the first of the Verity’ies. He started the group on a sunny afternoon when he rolled down a hill and bumped into Falsity at the bottom. The two became friends right away, even though they are complete opposites.',
          'Over time more balls joined, and the group took the name “the Verity’ies” after him. Verity says it was not his idea. Falsity says it was.',
        ],
      },
      {
        title: 'Relationships',
        paragraphs: [
          'Verity’s best friend is Hapity, who laughs at all of his jokes. His oldest friend is Falsity, which surprises many people, because Falsity almost never tells the truth. Verity says that someone has to keep an eye on him.',
        ],
      },
      {
        title: 'Trivia',
        list: [
          'Verity has never told a single lie. Not even a small one.',
          'His favourite weather is sunny, because it makes him “shine even more”.',
          'He is afraid of rain, because he once rolled into a puddle and Moggity laughed at him.',
        ],
      },
    ],
    scary: {
      name: 'Verity the Truth Hunter',
      color: '#a07c00',
      face: 'monster',
      infobox: {
        Color: 'Dark gold',
        Status: 'Transformed',
        Powers: 'Sees every secret',
        Weakness: 'Being lied to',
      },
      intro:
        'Verity the Truth Hunter is the transformed form of Verity. After the Great Transformation, Verity’s love of the truth turned into an obsession. He now hunts down every secret in the world.',
      sections: [
        {
          title: 'The transformation',
          paragraphs: [
            'Verity was the first to change. His bright yellow faded to a dark gold, and his friendly eyes began to glow red. He has not smiled a normal smile since.',
          ],
        },
        {
          title: 'Powers',
          paragraphs: [
            'The Truth Hunter can see every secret you ever had. His glowing eyes shine through walls, so there is no point in hiding. When he finds a secret, he tells everybody.',
          ],
        },
        {
          title: 'Weakness',
          paragraphs: [
            'Lies confuse him. If someone tells him a really good lie, he has to stop and think about it for a very long time.',
          ],
        },
      ],
    },
  },
  {
    name: 'Falsity',
    color: '#3a86ff',
    face: 'sly',
    size: 120,
    objectID: 1,
    infobox: {
      Color: 'Royal blue',
      Shape: 'Round (he says square)',
      Role: 'Trickster',
      'Known for': 'Never telling the truth',
      'Best friend': 'Verity',
      Catchphrase: '“I would never lie to you!”',
    },
    intro:
      'Falsity is a blue ball and one of the founding members of the Verity’ies. He is the exact opposite of Verity: almost nothing Falsity says is true. Despite this, he is one of the most popular members of the group, mostly because he is very funny.',
    sections: [
      {
        title: 'Appearance',
        paragraphs: [
          'Falsity is royal blue and has one eyebrow raised at all times, which gives him a sneaky look. He has a sly half smile that makes everybody wonder what he is planning.',
          'Falsity says he is actually square and that everyone else just sees him wrong. This is not true.',
        ],
      },
      {
        title: 'Personality',
        paragraphs: [
          'Falsity loves tricks, pranks and stories. Most of his stories are made up, and many of them are about how he once defeated a dragon, flew to the moon or won a race against a cheetah.',
          'Never believe Falsity when he says he did not eat the last cookie. The crumbs are always on his face.',
        ],
      },
      {
        title: 'History',
        paragraphs: [
          'Falsity was at the bottom of the hill when Verity rolled down it, which made him the second member of the Verity’ies. According to Falsity, he was actually the first, and Verity rolled into him on purpose.',
          'Falsity is at the centre of the event known as the Great Transformation. Not much is known about it, and Falsity refuses to talk about it.',
        ],
      },
      {
        title: 'Relationships',
        paragraphs: [
          'Falsity’s oldest friend is Verity. Angelity always forgives him for his lies, which he finds very annoying. Curiosity follows him around asking whether things he says are true, which he finds even more annoying.',
        ],
      },
      {
        title: 'Trivia',
        list: [
          'Falsity is the best hide-and-seek player in the group, because nobody ever knows where he really went.',
          'He claims to have 47 brothers. He has none.',
          'Rumour has it that if you poke Falsity very fast, many times in a row, something strange happens.',
        ],
      },
    ],
    scary: {
      name: 'Falsity the Deceiver',
      color: '#1d1b6b',
      face: 'monster',
      horns: true,
      infobox: {
        Color: 'Midnight blue',
        Status: 'Transformed (and proud of it)',
        Powers: 'Tricks anyone',
        Weakness: 'The truth',
      },
      intro:
        'Falsity the Deceiver is the transformed form of Falsity, and the one who caused the Great Transformation. It was Falsity all along. He tricked the whole gang into turning into monsters, and nobody noticed until it was too late.',
      sections: [
        {
          title: 'The transformation',
          paragraphs: [
            'Falsity grew two dark horns, and his blue turned the colour of the night sky. Of all the Verity’ies, he is the only one who seems to enjoy his new form.',
          ],
        },
        {
          title: 'Powers',
          paragraphs: [
            'The Deceiver can make anyone believe anything. Everything he ever told you was a lie. Even this sentence. Or is it?',
          ],
        },
        {
          title: 'How to undo it',
          paragraphs: [
            'Legends say that whoever caused the transformation can also undo it, in exactly the same way it started.',
          ],
        },
      ],
    },
  },
  {
    name: 'Cruelty',
    color: '#e63946',
    face: 'angry',
    size: 120,
    objectID: 2,
    infobox: {
      Color: 'Red',
      Shape: 'Round and grumpy',
      Role: 'The grumpy one',
      'Known for': 'Frowning',
      'Best friend': 'Nobody (he says)',
      Catchphrase: '“Hmph.”',
    },
    intro:
      'Cruelty is a red ball and the grumpiest member of the Verity’ies. He is almost always frowning, and nobody knows why, not even Cruelty. Although he says he does not like anybody, he shows up every single time the group meets.',
    sections: [
      {
        title: 'Appearance',
        paragraphs: [
          'Cruelty is bright red with angry eyebrows and a frown. Scientists from WikiVerity have studied old photos and have never found a single picture of him smiling.',
        ],
      },
      {
        title: 'Personality',
        paragraphs: [
          'Cruelty complains about everything: the weather is too sunny, the grass is too green, Hapity is too loud and Moggity is too handsome. He says “hmph” about 200 times a day.',
          'Deep down, many believe Cruelty is actually kind. He once rolled in front of Curiosity to stop her from falling into a hole, and then said he “just tripped”.',
        ],
      },
      {
        title: 'History',
        paragraphs: [
          'Cruelty joined the Verity’ies by accident. He was rolling away from a party that was “too fun”, and he rolled straight into the middle of the group. He has been there ever since.',
        ],
      },
      {
        title: 'Relationships',
        paragraphs: [
          'Lovity is sure that deep down Cruelty has a soft spot, and she has a secret plan to make him smile. So far it has not worked. Cruelty pretends to be annoyed by her, but he always waits for her when the group rolls somewhere.',
        ],
      },
      {
        title: 'Trivia',
        list: [
          'His favourite colour is grey. He says red is “too cheerful”.',
          'He secretly likes Hapity’s jokes, but he never laughs out loud.',
          'Cruelty has never missed a single meeting of the Verity’ies.',
        ],
      },
    ],
    scary: {
      name: 'Cruelty the Destroyer',
      color: '#7a0010',
      face: 'monster',
      horns: true,
      infobox: {
        Color: 'Dark red',
        Status: 'Transformed',
        Powers: 'Flattens everything',
        Weakness: 'Hugs',
      },
      intro:
        'Cruelty the Destroyer is the transformed form of Cruelty. Cruelty was grumpy before. Now he is furious. He rolls through towns and flattens everything in his way.',
      sections: [
        {
          title: 'The transformation',
          paragraphs: [
            'Cruelty grew horns, and his red turned almost black. His frown turned into a mouth full of sharp teeth.',
          ],
        },
        {
          title: 'Weakness',
          paragraphs: [
            'The only thing that can stop him is a hug from Lovity. But Lovity has changed too...',
          ],
        },
      ],
    },
  },
  {
    name: 'Moggity',
    color: '#00b4d8',
    face: 'cool',
    size: 120,
    objectID: 3,
    infobox: {
      Color: 'Light blue',
      Shape: 'Round (and handsome)',
      Role: 'The cool one',
      'Known for': 'Being handsome',
      'Best friend': 'His reflection',
      Catchphrase: '“Looking good.”',
    },
    intro:
      'Moggity is a light blue ball and the most handsome member of the Verity’ies, and he knows it. He is famous for his perfect hair, his shiny sunglasses and a smile that makes everyone else look plain.',
    sections: [
      {
        title: 'Appearance',
        paragraphs: [
          'Moggity has swept brown hair, black sunglasses with a shine on each lens, and a confident half smile. A small sparkle floats next to his head at all times. Nobody knows where it comes from.',
          'He wears his sunglasses day and night, even indoors and even when he sleeps.',
        ],
      },
      {
        title: 'Personality',
        paragraphs: [
          'Moggity is cool, calm and confident. He has never lost a staring contest, mostly because nobody can see his eyes.',
          'He checks his reflection in every puddle he rolls past. Sometimes he rolls past the same puddle twice.',
        ],
      },
      {
        title: 'History',
        paragraphs: [
          'Moggity joined the Verity’ies after seeing them in a photo and deciding that they “needed someone good-looking”. Verity told him that this was not true. Moggity joined anyway.',
        ],
      },
      {
        title: 'Relationships',
        paragraphs: [
          'Moggity gets along with everybody, but he spends the most time with himself. Cruelty thinks he is too handsome. Verity once said his hair looked like a squashed bird’s nest, which Moggity still has not forgotten.',
        ],
      },
      {
        title: 'Trivia',
        list: [
          'Moggity owns 34 pairs of identical sunglasses.',
          'His hair takes two hours to style every morning.',
          'Nobody has ever seen his eyes. Some believe he does not have any.',
        ],
      },
    ],
    scary: {
      name: 'Moggity the Mirror Monster',
      color: '#035a6b',
      face: 'evilcool',
      infobox: {
        Color: 'Deep teal',
        Status: 'Transformed',
        Powers: 'Lives in every mirror',
        Weakness: 'Ugly mirrors',
      },
      intro:
        'Moggity the Mirror Monster is the transformed form of Moggity. He looked into a puddle for so long that the puddle looked back. Now he lives inside every mirror.',
      sections: [
        {
          title: 'The transformation',
          paragraphs: [
            'His perfect hair turned into black spikes, and his sunglasses cracked. Behind them, two red eyes are watching you.',
          ],
        },
        {
          title: 'Powers',
          paragraphs: [
            'The Mirror Monster can jump from one mirror to another. If you look into a mirror at night and see a cracked pair of sunglasses, it is already too late.',
          ],
        },
      ],
    },
  },
  {
    name: 'Lovity',
    color: '#ff8fab',
    face: 'love',
    size: 120,
    objectID: 4,
    infobox: {
      Color: 'Pink',
      Shape: 'Round and huggable',
      Role: 'The kind one',
      'Known for': 'The best hugs',
      'Best friend': 'Everybody',
      Catchphrase: '“Group hug!”',
    },
    intro:
      'Lovity is a pink ball and the most loving member of the Verity’ies. She loves everybody, even Cruelty. She has hearts for eyes and is known for giving the best hugs in the whole group.',
    sections: [
      {
        title: 'Appearance',
        paragraphs: [
          'Lovity is soft pink with two red hearts for eyes and a big warm smile. When she is very happy, which is most of the time, her hearts seem to glow.',
        ],
      },
      {
        title: 'Personality',
        paragraphs: [
          'When someone is sad, Lovity is the first one there to cheer them up. She remembers everybody’s birthday and always brings a card.',
          'She almost never gets angry. The only thing that makes her upset is when someone is left out.',
        ],
      },
      {
        title: 'History',
        paragraphs: [
          'Lovity joined the Verity’ies when she saw Cruelty sitting alone and rolled over to give him a hug. Cruelty rolled away. Lovity followed him, and that is how she found the rest of the group.',
        ],
      },
      {
        title: 'Relationships',
        paragraphs: [
          'Lovity has a secret plan to make Cruelty smile one day. It has not worked yet, but she never gives up. She is also very close to Angelity, and the two of them are known as “the nice ones”.',
        ],
      },
      {
        title: 'Trivia',
        list: [
          'Lovity has given over 10,000 hugs. She keeps count.',
          'Her favourite day of the year is Valentine’s Day.',
          'She once hugged a cactus by mistake. She says it was “still worth it”.',
        ],
      },
    ],
    scary: {
      name: 'Lovity the Heartbreaker',
      color: '#6b1d3a',
      face: 'heartbreak',
      infobox: {
        Color: 'Dark wine red',
        Status: 'Transformed',
        Powers: 'The creepiest stare',
        Weakness: 'Kind words',
      },
      intro:
        'Lovity the Heartbreaker is the transformed form of Lovity. Her heart eyes cracked in two. Lovity does not give hugs anymore. She gives the creepiest stares in the gang.',
      sections: [
        {
          title: 'The transformation',
          paragraphs: [
            'Her pink faded to a dark wine red, and her glowing hearts turned dark and cracked. Her warm smile became a jagged grin.',
          ],
        },
        {
          title: 'Sightings',
          paragraphs: [
            'If you hear a sad little laugh at night, do not turn around.',
          ],
        },
      ],
    },
  },
  {
    name: 'Obesity',
    color: '#ffd23f',
    face: 'happy',
    size: 210,
    objectID: 5,
    infobox: {
      Color: 'Yellow',
      Shape: 'Very round',
      Role: 'Goalkeeper and snack bringer',
      'Known for': 'Being the biggest',
      'Best friend': 'Hapity',
      Catchphrase: '“Who wants snacks?”',
    },
    intro:
      'Obesity is a yellow ball and by far the biggest member of the Verity’ies. He rolls slowly, laughs loudly and always brings snacks for everyone. He is one of the most loved members of the group.',
    sections: [
      {
        title: 'Appearance',
        paragraphs: [
          'Obesity is yellow like Verity, but more than twice as big. He has a huge friendly smile. People sometimes mix him up with Verity from far away, until he gets closer.',
        ],
      },
      {
        title: 'Personality',
        paragraphs: [
          'Obesity is generous and cheerful. His laugh is so loud that the ground shakes a little, and then everybody else starts laughing too.',
          'He loves food more than anything, but he loves sharing it even more. Nobody in the group has ever been hungry when Obesity is around.',
        ],
      },
      {
        title: 'History',
        paragraphs: [
          'Obesity joined the Verity’ies when he rolled to their picnic by following the smell of sandwiches. He brought more sandwiches with him, and the group decided he could stay forever.',
        ],
      },
      {
        title: 'Sports',
        paragraphs: [
          'When the Verity’ies play football, Obesity is always the goalkeeper, because nothing gets past him. In 312 games, he has never let in a single goal.',
        ],
      },
      {
        title: 'Trivia',
        list: [
          'Obesity can carry up to 50 sandwiches at once.',
          'He and Hapity laugh at the same jokes, which makes the ground shake twice as much.',
          'He is the slowest roller in the group, but he never comes last, because everybody waits for the snacks.',
        ],
      },
    ],
    scary: {
      name: 'Obesity the Devourer',
      color: '#7a5c00',
      face: 'monster',
      infobox: {
        Color: 'Dark mustard',
        Status: 'Transformed',
        Powers: 'Eats anything',
        Weakness: 'Vegetables',
      },
      intro:
        'Obesity the Devourer is the transformed form of Obesity, and the biggest monster of them all. Obesity used to bring snacks for everyone. Now everyone is the snack.',
      sections: [
        {
          title: 'The transformation',
          paragraphs: [
            'His friendly smile turned into the biggest mouth full of teeth in the group. His laugh still shakes the ground, but nobody laughs along anymore. They run.',
          ],
        },
        {
          title: 'Weakness',
          paragraphs: [
            'The Devourer will eat anything, except vegetables. If you carry a carrot, you are safe.',
          ],
        },
      ],
    },
  },
  {
    name: 'Hapity',
    color: '#52b788',
    face: 'laugh',
    size: 120,
    objectID: 6,
    infobox: {
      Color: 'Green',
      Shape: 'Round and giggly',
      Role: 'The funny one',
      'Known for': 'Laughing all the time',
      'Best friend': 'Verity',
      Catchphrase: '“Hahahaha!”',
    },
    intro:
      'Hapity is a green ball and the happiest member of the Verity’ies, and maybe the happiest ball in the whole world. He laughs so much that his eyes squeeze shut. He is known for telling terrible jokes that everybody laughs at anyway.',
    sections: [
      {
        title: 'Appearance',
        paragraphs: [
          'Hapity is leaf green, with his eyes almost always squeezed shut from laughing and a big open mouth. Nobody can remember seeing him with his mouth closed.',
        ],
      },
      {
        title: 'Personality',
        paragraphs: [
          'Hapity finds everything funny. Even when it rains, he rolls through the puddles and giggles at the splashes. If somebody in the gang is sad, Hapity tells a joke to cheer them up.',
          'His most famous joke is: “Why did the ball stop rolling? Because it was tired of going round in circles!” He has told it 900 times.',
        ],
      },
      {
        title: 'History',
        paragraphs: [
          'Hapity joined the Verity’ies after laughing so loudly at one of Verity’s jokes that the whole group came to see what was going on. Verity says it was the first time anyone had laughed at one of his jokes.',
        ],
      },
      {
        title: 'Relationships',
        paragraphs: [
          'Hapity is Verity’s best friend. He also gets along very well with Obesity, and the two of them laughing together has been known to cause small earthquakes. Cruelty says Hapity is “too loud”.',
        ],
      },
      {
        title: 'Trivia',
        list: [
          'Hapity has laughed for 14 hours straight.',
          'He laughs in his sleep.',
          'He has tried to make Cruelty laugh 3,000 times. It worked once, but nobody saw it.',
        ],
      },
    ],
    scary: {
      name: 'Hapity the Laughing Nightmare',
      color: '#1b4332',
      face: 'monster',
      infobox: {
        Color: 'Dark forest green',
        Status: 'Transformed',
        Powers: 'A laugh nobody can escape',
        Weakness: 'A really good joke',
      },
      intro:
        'Hapity the Laughing Nightmare is the transformed form of Hapity. Hapity is still laughing. He has not stopped laughing for days, and now nobody thinks it is funny.',
      sections: [
        {
          title: 'The transformation',
          paragraphs: [
            'His leaf green turned the colour of a dark forest at night, and his squeezed-shut eyes opened. They glow red.',
          ],
        },
        {
          title: 'Sightings',
          paragraphs: [
            'If you hear giggling in the dark, that is Hapity. And he is getting closer.',
          ],
        },
      ],
    },
  },
  {
    name: 'Angelity',
    color: '#ffffff',
    face: 'angel',
    size: 120,
    objectID: 7,
    infobox: {
      Color: 'White',
      Shape: 'Round with a halo',
      Role: 'Guardian of the group',
      'Known for': 'Her golden halo',
      'Best friend': 'Lovity',
      Catchphrase: '“I forgive you.”',
    },
    intro:
      'Angelity is a white ball and the kindest member of the Verity’ies. She has a golden halo that floats above her head and glows at night. She watches over the whole group and makes sure nobody gets hurt.',
    sections: [
      {
        title: 'Appearance',
        paragraphs: [
          'Angelity is pure white with a golden halo, peaceful closed eyes and rosy pink cheeks. At night, her halo glows softly, so the other Verity’ies use her as a night light.',
        ],
      },
      {
        title: 'Personality',
        paragraphs: [
          'Angelity is gentle, patient and calm. She never gets angry, not even when Falsity tells her lies. She just smiles and forgives him, which annoys Falsity more than anything.',
          'She watches over the whole group and makes sure nobody rolls off a cliff.',
        ],
      },
      {
        title: 'History',
        paragraphs: [
          'Nobody knows exactly where Angelity came from. One day she simply floated down from the clouds and landed in the middle of the group. When Curiosity asked her where she came from, she just smiled.',
        ],
      },
      {
        title: 'Relationships',
        paragraphs: [
          'Angelity’s best friend is Lovity, and the two of them are known as “the nice ones”. She is the only Verity’ie who has never had an argument with anybody.',
        ],
      },
      {
        title: 'Trivia',
        list: [
          'Her halo is made of real gold. Probably.',
          'She can float a few centimetres above the ground when she is very happy.',
          'She has forgiven Falsity 4,812 times.',
        ],
      },
    ],
    scary: {
      name: 'Angelity the Fallen',
      color: '#3a3a46',
      face: 'fallen',
      infobox: {
        Color: 'Storm grey',
        Status: 'Transformed',
        Powers: 'Watches everything',
        Weakness: 'Sunlight',
      },
      intro:
        'Angelity the Fallen is the transformed form of Angelity. She fell from the sky, and her halo cracked in half. Now it glows red instead of gold.',
      sections: [
        {
          title: 'The transformation',
          paragraphs: [
            'Her pure white turned storm grey, and her peaceful closed eyes opened. Dark lines run down her cheeks where the pink used to be.',
          ],
        },
        {
          title: 'Behaviour',
          paragraphs: [
            'She used to watch over the gang. Now she is just... watching.',
          ],
        },
      ],
    },
  },
  {
    name: 'Curiosity',
    color: '#39ff14',
    face: 'curious',
    size: 120,
    objectID: 8,
    infobox: {
      Color: 'Neon green',
      Shape: 'Round (she measured)',
      Role: 'Explorer',
      'Known for': 'Asking questions',
      'Best friend': 'Everybody who answers',
      Catchphrase: '“But why?”',
    },
    intro:
      'Curiosity is a neon green ball and the youngest member of the Verity’ies. She glows bright neon green and wants to know everything. She asks more questions than all of the other Verity’ies put together.',
    sections: [
      {
        title: 'Appearance',
        paragraphs: [
          'Curiosity is the brightest ball in the group. She glows neon green and has big wide eyes that are always looking up, as if she is thinking of her next question. A question mark floats next to her head.',
        ],
      },
      {
        title: 'Personality',
        paragraphs: [
          'Why is the sky blue? Why are balls round? What is inside a cloud? Curiosity asks questions all day long. Her eyes are always wide open, because she does not want to miss a single thing.',
          'She rolls into every hole and peeks behind every door. Usually she finds something amazing. Sometimes she gets stuck.',
        ],
      },
      {
        title: 'History',
        paragraphs: [
          'Curiosity joined the Verity’ies when she followed them for a whole day, asking where they were going. By the end of the day, she was part of the group.',
        ],
      },
      {
        title: 'Relationships',
        paragraphs: [
          'Curiosity likes everyone who answers her questions, which makes Verity one of her favourites. She often follows Falsity around asking whether the things he says are true. Cruelty once saved her from falling into a hole, and she still asks him why.',
        ],
      },
      {
        title: 'Trivia',
        list: [
          'Curiosity asks about 3,000 questions a day.',
          'Her favourite word is “why”.',
          'She is the only Verity’ie who has ever looked inside a cloud. She says it was “wet”.',
        ],
      },
    ],
    scary: {
      name: 'Curiosity the All-Seeing',
      color: '#0b2e06',
      face: 'manyeyes',
      infobox: {
        Color: 'Dark swamp green',
        Status: 'Transformed',
        Powers: 'Sees everything',
        Weakness: 'Closed doors',
      },
      intro:
        'Curiosity the All-Seeing is the transformed form of Curiosity. She wanted to see everything, so she grew more eyes. And more. And more.',
      sections: [
        {
          title: 'The transformation',
          paragraphs: [
            'Her bright neon faded to the green of a dark swamp, and eight glowing green eyes opened all over her face. She is the only transformed Verity’ie with green eyes instead of red.',
          ],
        },
        {
          title: 'Powers',
          paragraphs: [
            'Now she sees everything you do. Every single thing. She is looking at you right now.',
          ],
        },
      ],
    },
  },
  {
    name: 'Serity Vex',
    color: '#7b2cbf',
    face: 'serious',
    size: 120,
    objectID: 9,
    infobox: {
      Color: 'Purple',
      Shape: 'Round (seriously)',
      Role: 'Mystery expert',
      'Known for': 'Riddles and never smiling',
      'Best friend': 'Curiosity',
      Catchphrase: '“Think about it.”',
    },
    intro:
      'Serity Vex is a purple ball and the most serious member of the Verity’ies. He wears a monocle, speaks in riddles and has never been seen smiling, not even once. His second name, Vex, means “to puzzle or annoy”, and he does both.',
    sections: [
      {
        title: 'Appearance',
        paragraphs: [
          'Serity Vex is deep purple, with narrowed, thoughtful eyes and a perfectly straight mouth. Over his right eye he wears a shiny golden monocle, which he polishes whenever he is thinking, which is all the time.',
        ],
      },
      {
        title: 'Personality',
        paragraphs: [
          'Serity Vex is calm, clever and extremely serious. He answers almost every question with a riddle. When Hapity asked him what his favourite food was, he replied: “What has a skin, a heart and no bones?” (The answer was a peach. It took Hapity four days.)',
          'He is not grumpy like Cruelty. He is just very, very serious. He says that smiling “wastes energy that could be used for thinking”.',
        ],
      },
      {
        title: 'History',
        paragraphs: [
          'Nobody remembers Serity Vex joining the Verity’ies. One day he was simply there, sitting at the edge of the group, as if he had always been there. When Verity asked him how long he had been a member, he said: “Longer than you think, shorter than you fear.”',
        ],
      },
      {
        title: 'Relationships',
        paragraphs: [
          'Serity Vex gets along best with Curiosity, because she loves questions and he loves giving answers that are really more questions. He enjoys puzzling Falsity, because Falsity can never tell if Serity Vex is telling the truth either. Verity is the only Verity’ie who has ever solved one of his riddles on the first try.',
        ],
      },
      {
        title: 'Trivia',
        list: [
          'Serity Vex knows 1,001 riddles. He has only ever told 600 of them.',
          'His monocle is not for seeing. It is “for looking serious”.',
          'Lovity has tried to make him smile almost as many times as she has tried with Cruelty.',
        ],
      },
    ],
    scary: {
      name: 'Serity Vex the Riddle Wraith',
      color: '#240046',
      face: 'hollow',
      infobox: {
        Color: 'Void purple',
        Status: 'Transformed',
        Powers: 'Traps you in riddles',
        Weakness: 'The right answer',
      },
      intro:
        'Serity Vex the Riddle Wraith is the transformed form of Serity Vex. His riddles used to be annoying. Now they are a trap. Anyone who cannot answer one is stuck with him forever.',
      sections: [
        {
          title: 'The transformation',
          paragraphs: [
            'His purple turned as dark as an empty sky, his monocle cracked, and his eyes became two hollow black holes with tiny white lights deep inside.',
          ],
        },
        {
          title: 'The last riddle',
          paragraphs: [
            '“The more you take, the more you leave behind. What am I?” If you know the answer, you are safe. If you do not... footsteps.',
          ],
        },
      ],
    },
  },
  {
    name: 'Sussity',
    color: '#ff2a2a',
    face: 'sus',
    size: 120,
    objectID: 10,
    infobox: {
      Color: 'Red',
      Shape: 'Round (suspiciously round)',
      Role: 'Prankster and joke teller',
      'Known for': 'Thinking everything is “sus”',
      'Best friend': 'Serity Vex',
      Catchphrase: '“Hmm… that’s kinda sus.”',
    },
    intro:
      'Sussity is a red ball and the joker of the Verity’ies. He is always telling jokes, always side-eyeing somebody, and he thinks absolutely everything is “sus”: the weather, the cake, the moon, and especially Falsity.',
    sections: [
      {
        title: 'Appearance',
        paragraphs: [
          'Sussity is bright red, a little brighter than Cruelty, which Cruelty finds very annoying. He has one eyebrow permanently raised, eyes that always look to the side, and a crooked little smirk, as if he knows something you do not.',
        ],
      },
      {
        title: 'Personality',
        paragraphs: [
          'Sussity cannot go five minutes without a joke. Most of them are terrible. His favourite kind are “sus” jokes: “Why did the cookie go to the doctor? Because it felt crummy… and kinda sus.”',
          'He is suspicious of everything. When Verity says something true, Sussity says “sus”. When Falsity says something false, Sussity says “very sus”. When nobody says anything at all, Sussity says “quiet… too quiet… sus.”',
          'Under all the jokes, Sussity is actually very good at noticing things. He is usually the first one to spot when something is wrong, even if nobody believes him because he says “sus” about everything.',
        ],
      },
      {
        title: 'History',
        paragraphs: [
          'Sussity joined the Verity’ies by accusing Verity of being a fake Verity. The others laughed so hard that he decided to stay. He has been investigating the group ever since and has written 312 pages of notes. Every page says “sus”.',
        ],
      },
      {
        title: 'Relationships',
        paragraphs: [
          'Sussity’s best friend is Serity Vex, which surprises everybody, because Serity Vex never laughs. But they are a perfect team: Serity Vex asks the mysterious questions, and Sussity suspects everyone until they find the answer. Together they call themselves “the Investigators”. Serity Vex has never laughed at a Sussity joke, but once, after a really bad one, the corner of his mouth moved. Sussity still talks about it.',
          'Hapity is Sussity’s favourite audience, because Hapity laughs at every joke, even the bad ones (all of them). Falsity and Sussity have a friendly rivalry: Falsity tries to fool him, and Sussity always says “sus” before Falsity even starts.',
        ],
      },
      {
        title: 'Trivia',
        list: [
          'Sussity has said the word “sus” an estimated 48,000 times.',
          'His favourite joke: “Why don’t eggs tell jokes? They’d crack each other up.” He has told it 900 times.',
          'He once suspected himself and investigated for three days.',
        ],
      },
    ],
    scary: {
      name: 'Sussity the Imposter',
      color: '#5c0000',
      face: 'imposter',
      infobox: {
        Color: 'Dark blood red',
        Status: 'Transformed',
        Powers: 'Pretends to be anyone',
        Weakness: 'Being caught',
      },
      intro:
        'Sussity the Imposter is the transformed form of Sussity. For years he said everyone was sus. Now he is the sus one: he hides among the others, and nobody knows which Verity’ie is really him.',
      sections: [
        {
          title: 'The transformation',
          paragraphs: [
            'His red went dark, his smirk split into a jagged grin, and his side-eyes started to glow. He does not tell jokes anymore. He just watches you, from the side, and whispers: “You’re next… to be suspicious.”',
          ],
        },
        {
          title: 'Emergency meeting',
          paragraphs: [
            'If you ever count one Verity’ie too many, stay calm, do not turn your back, and whatever you do, do not say “sus”.',
          ],
        },
      ],
    },
  },
];
