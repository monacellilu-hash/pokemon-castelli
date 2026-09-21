# Oggetti Gen 1-3 (da Essentials FRLG/PBS/items.txt), filtrati

Fonte: `Essentials FRLG/PBS/items.txt`. Filtrato a mano per tenere solo oggetti coerenti con
Gen 1-2-3 (Rosso/Blu/Giallo, Oro/Argento/Cristallo, Rubino/Zaffiro/Smeraldo/FireRed/LeafGreen) —
esclusi tutti gli oggetti Gen 4+ (Piastre, Air Balloon, Choice Specs/Scarf, Life Orb, Eviolite,
sementi di terreno, bacche anti-tipo Occa/Passho/ecc., Power Weight/Bracer/..., Assault Vest,
Heavy-Duty Boots, Terrain Extender, Weakness Policy, e simili).

**Nomi/descrizioni originali in inglese** (da tradurre quando/se si useranno). Prezzo in ₽ del
gioco originale, da ritarare sull'economia di Pokémon Castelli Romani — non usare 1:1.

**Cosa ha gia' un equivalente in `js/data.js` OGGETTI**: ball, pozioni/cura, repellente,
cura-stato, pietre evolutive, oggetti da scambio-evoluzione, MT, pepita (= Nugget). Le sezioni
sotto sono per lo piu' roba NUOVA rispetto a quello che il motore gestisce oggi: held item,
vitamine (EV), X Items da battaglia, fossili, bacche, mail — ognuna implica funzionalita' di
gioco che oggi NON esistono ancora (slot oggetto tenuto, sistema EV, buff temporanei in
battaglia, ecc.), quindi vanno introdotte una alla volta se e quando servono, non solo come dati.


## Ball (12)

| Nome | Prezzo | Effetto |
|---|---|---|
| Dive Ball | 1000 | A somewhat different Poké Ball that works especially well on Pokémon that live underwater. |
| Great Ball | 600 | A good, high-performance Ball that provides a higher Pokémon catch rate than a standard Poké Ball. |
| Luxury Ball | 3000 | A comfortable Poké Ball that makes a caught wild Pokémon quickly grow friendly. |
| Master Ball | 0 | The best Ball with the ultimate level of performance. It will catch any wild Pokémon without fail. |
| Nest Ball | 1000 | A somewhat different Poké Ball that works especially well on weaker Pokémon in the wild. |
| Net Ball | 1000 | A somewhat different Poké Ball that works especially well on Water- and Bug-type Pokémon. |
| Poké Ball | 200 | A device for catching wild Pokémon. It is thrown like a ball at the target. It is designed as a capsule system. |
| Premier Ball | 200 | A somewhat rare Poké Ball that has been specially made to commemorate an event of some sort. |
| Repeat Ball | 1000 | A somewhat different Poké Ball that works especially well on Pokémon species that were previously caught. |
| Safari Ball | 0 | A special Poké Ball that is used only in the Safari Zone. It is decorated in a camouflage pattern. |
| Timer Ball | 1000 | A somewhat different Ball that becomes progressively better the more turns there are in a battle. |
| Ultra Ball | 800 | An ultra-performance Ball that provides a higher Pokémon catch rate than a Great Ball. |

## Cura/Revive/Repellenti (36)

| Nome | Prezzo | Effetto |
|---|---|---|
| Antidote | 200 | A spray-type medicine. It lifts the effect of poison from one Pokémon. |
| Awakening | 200 | A spray-type medicine. It awakens a Pokémon from the clutches of sleep. |
| Black Flute | 20 | A black flute made from blown glass. Its melody makes wild Pokémon less likely to appear. |
| Blue Flute | 20 | A blue flute made from blown glass. Its melody awakens a single Pokémon from sleep. |
| Burn Heal | 200 | A spray-type medicine. It heals a single Pokémon that is suffering from a burn. |
| Elixir | 3000 | It restores the PP of all the moves learned by the targeted Pokémon by 10 points each. |
| Energy Powder | 500 | A very bitter medicinal powder. It can be used to restore 60 HP to a single Pokémon. |
| Energy Root | 1200 | An extremely bitter medicinal root. It can be used to restore 120 HP to a single Pokémon. |
| Escape Rope | 0 | A long, durable rope. Use it to escape instantly from a cave or a dungeon. |
| Ether | 1200 | It restores the PP of a Pokémon's selected move by a maximum of 10 points. |
| Fresh Water | 200 | Water with high mineral content. It can be used to restore 30 HP to a single Pokémon. |
| Full Heal | 400 | A spray-type medicine. It heals all the status problems of a single Pokémon. |
| Full Restore | 3000 | A medicine that fully restores the HP and heals any status problems of a single Pokémon. |
| Heal Powder | 300 | A very bitter medicine powder. It heals all the status problems of a single Pokémon. |
| Hyper Potion | 1500 | A spray-type medicine for treating wounds. It can be used to restore 120 HP to a single Pokémon. |
| Ice Heal | 200 | A spray-type medicine. It defrosts a Pokémon that has been frozen solid. |
| Lemonade | 350 | A very sweet and refreshing drink. It can be used to restore 70 HP to a single Pokémon. |
| Max Elixir | 4500 | It fully restores the PP of all the moves learned by the targeted Pokémon. |
| Max Ether | 2000 | It fully restores the PP of a single selected move that has been learned by the target Pokémon. |
| Max Potion | 2500 | A spray-type medicine for treating wounds. It can completely restore the max HP of a single Pokémon. |
| Max Repel | 900 | An item that prevents weak wild Pokémon from appearing for 250 steps after its use. |
| Max Revive | 4000 | A medicine that revives a fainted Pokémon. It fully restores the Pokémon's HP. |
| Moomoo Milk | 600 | Milk with a very high nutrition content. It restores the HP of one Pokémon by 100 points. |
| Paralyze Heal | 200 | A spray-type medicine. It eliminates paralysis from a single Pokémon. |
| Poké Doll | 300 | A doll that attracts Pokémon. Use it to flee from any battle with a wild Pokémon. |
| Poké Flute | 0 | A flute that is said to instantly awaken any Pokémon. It has a lovely tone. |
| Potion | 200 | A spray-type medicine for treating wounds. It can be used to restore 20 HP to a single Pokémon. |
| Red Flute | 20 | A red flute made from blown glass. Its melody snaps a single Pokémon out of infatuation. |
| Repel | 400 | An item that prevents weak wild Pokémon from appearing for 100 steps after its use. |
| Revival Herb | 2800 | A very bitter medicinal herb. It revives a fainted Pokémon, fully restoring its HP. |
| Revive | 2000 | A medicine that revives a fainted Pokémon. It restores half the Pokémon's maximum HP. |
| Soda Pop | 300 | A highly carbonated soda drink. It can be used to restore 50 HP to a single Pokémon. |
| Super Potion | 700 | A spray-type medicine for treating wounds. It can be used to restore 60 HP to a single Pokémon. |
| Super Repel | 700 | An item that prevents weak wild Pokémon from appearing for 200 steps after its use. |
| White Flute | 20 | A white flute made from blown glass. Its melody makes wild Pokémon more likely to appear. |
| Yellow Flute | 20 | A yellow flute made from blown glass. Its melody snaps a single Pokémon out of confusion. |

## Vitamine (EV) (9)

| Nome | Prezzo | Effetto |
|---|---|---|
| Calcium | 10000 | A nutritious drink for Pokémon. It raises the base Sp. Atk (Special Attack) stat of a single Pokémon. |
| Carbos | 10000 | A nutritious drink for Pokémon. It raises the base Speed stat of a single Pokémon. |
| HP Up | 10000 | A nutritious drink for Pokémon. It raises the base HP of a single Pokémon. |
| Iron | 10000 | A nutritious drink for Pokémon. It raises the base Defense stat of a single Pokémon. |
| PP Max | 10000 | It maximally raises the top PP of a selected move that has been learned by the target Pokémon. |
| PP Up | 10000 | It slightly raises the maximum PP of a selected move that has been learned by the target Pokémon. |
| Protein | 10000 | A nutritious drink for Pokémon. It raises the base Attack stat of a single Pokémon. |
| Rare Candy | 10000 | A candy that is packed with energy. It raises the level of a single Pokémon by one. |
| Zinc | 10000 | A nutritious drink for Pokémon. It raises the base Sp. Def (Special Defense) stat of a single Pokémon. |

## Potenziatori da battaglia (X Items) (8)

| Nome | Prezzo | Effetto |
|---|---|---|
| Dire Hit | 1000 | An item that raises the critical-hit ratio greatly. It wears off if the Pokémon is withdrawn. |
| Guard Spec. | 1500 | An item that prevents stat reduction among the Trainer's party Pokémon for five turns after use. |
| X Accuracy | 1000 | An item that sharply boosts the accuracy of a Pokémon while it remains in battle. |
| X Attack | 1000 | An item that sharply boosts the Attack stat of a Pokémon while it remains in battle. |
| X Defense | 2000 | An item that sharply boosts the Defense of a Pokémon while it remains in battle. |
| X Sp. Atk | 1000 | An item that sharply boosts the Sp. Atk stat of a Pokémon while it remains in battle. |
| X Sp. Def | 2000 | An item that sharply boosts the Sp. Def stat of a Pokémon while it remains in battle. |
| X Speed | 1000 | An item that sharply boosts the Speed stat of a Pokémon while it remains in battle. |

## Pietre evolutive (6)

| Nome | Prezzo | Effetto |
|---|---|---|
| Fire Stone | 3000 | A peculiar stone that makes certain species of Pokémon evolve. It is colored orange. |
| Leaf Stone | 3000 | A peculiar stone that makes certain species of Pokémon evolve. It has a leaf pattern. |
| Moon Stone | 3000 | A peculiar stone that makes certain species of Pokémon evolve. It is as black as the night sky. |
| Sun Stone | 3000 | A peculiar stone that makes certain species of Pokémon evolve. It is as red as the sun. |
| Thunder Stone | 3000 | A peculiar stone that makes certain species of Pokémon evolve. It has a thunderbolt pattern. |
| Water Stone | 3000 | A peculiar stone that makes certain species of Pokémon evolve. It is a clear, light blue. |

## Fossili (5)

| Nome | Prezzo | Effetto |
|---|---|---|
| Claw Fossil | 7000 | A fossil of an ancient Pokémon that lived in the sea. It appears to be part of a claw. |
| Dome Fossil | 7000 | A fossil of an ancient Pokémon that lived in the sea. It appears to be part of a shell. |
| Helix Fossil | 7000 | A fossil of an ancient Pokémon that lived in the sea. It appears to be part of a seashell. |
| Old Amber | 1000 | A piece of amber that contains the genes of an ancient Pokémon. It is clear with a reddish tint. |
| Root Fossil | 7000 | A fossil of an ancient Pokémon that lived in the sea. It appears to be part of a plant root. |

## Tesori (da vendere) (10)

| Nome | Prezzo | Effetto |
|---|---|---|
| Big Mushroom | 5000 | A large and rare mushroom. It is sought after by collectors. |
| Big Pearl | 8000 | A quite-large pearl that sparkles in a pretty silver color. It can be sold at a high price to shops. |
| Heart Scale | 100 | A pretty, heart-shaped scale that is extremely rare. It glows faintly in the colors of the rainbow. |
| Nugget | 10000 | A nugget of pure gold that gives off a lustrous gleam. It can be sold at a high price to shops. |
| Pearl | 2000 | A somewhat-small pearl that sparkles in a pretty silver color. It can be sold cheaply to shops. |
| Shoal Salt | 20 | Pure salt that can be discovered deep inside the Shoal Cave. A maniac will buy it for a high price. |
| Shoal Shell | 20 | A pretty seashell that can be found deep inside the Shoal Cave. A maniac will buy it for a high price. |
| Star Piece | 12000 | A shard of a pretty gem that sparkles in a red color. It can be sold at a high price to shops. |
| Stardust | 3000 | Lovely, red-colored sand with a loose, silky feel. It can be sold at a high price to shops. |
| Tiny Mushroom | 500 | A small and rare mushroom. It is sought after by collectors. |

## Potenziatori di tipo (held) (17)

| Nome | Prezzo | Effetto |
|---|---|---|
| Black Belt | 3000 | An item to be held by a Pokémon. It is a belt that boosts determination and Fighting-type moves. |
| Black Glasses | 3000 | An item to be held by a Pokémon. It is a shady-looking pair of glasses that boosts Dark-type moves. |
| Charcoal | 3000 | An item to be held by a Pokémon. It is a combustible fuel that boosts the power of Fire-type moves. |
| Dragon Fang | 3000 | An item to be held by a Pokémon. It is a hard and sharp fang that ups the power of Dragon-type moves. |
| Hard Stone | 3000 | An item to be held by a Pokémon. It is an unbreakable stone that ups the power of Rock-type moves. |
| Magnet | 3000 | An item to be held by a Pokémon. It is a powerful magnet that boosts the power of Electric-type moves. |
| Metal Coat | 3000 | An item to be held by a Pokémon. It is a special metallic film that ups the power of Steel-type moves. |
| Miracle Seed | 3000 | An item to be held by a Pokémon. It is a seed imbued with life that ups the power of Grass-type moves. |
| Mystic Water | 3000 | An item to be held by a Pokémon. It is a teardrop-shaped gem that ups the power of Water-type moves. |
| Never-Melt Ice | 3000 | An item to be held by a Pokémon. It is a piece of ice that repels heat and boosts Ice-type moves. |
| Poison Barb | 3000 | An item to be held by a Pokémon. It is a small, poisonous barb that ups the power of Poison-type moves. |
| Sharp Beak | 3000 | An item to be held by a Pokémon. It is a long, sharp beak that boosts the power of Flying-type moves. |
| Silk Scarf | 3000 | An item to be held by a Pokémon. It is a sumptuous scarf that boosts the power of Normal-type moves. |
| Silver Powder | 3000 | An item to be held by a Pokémon. It is a shiny, silver powder that ups the power of Bug-type moves. |
| Soft Sand | 3000 | An item to be held by a Pokémon. It is a loose, silky sand that boosts the power of Ground-type moves. |
| Spell Tag | 3000 | An item to be held by a Pokémon. It is a sinister, eerie tag that boosts the power of Ghost-type moves. |
| Twisted Spoon | 3000 | An item to be held by a Pokémon. It is a spoon imbued with telekinetic power that boosts Psychic-type moves. |

## Oggetti da tenere (held item, altro) (17)

| Nome | Prezzo | Effetto |
|---|---|---|
| Amulet Coin | 10000 | An item to be held by a Pokémon. It doubles a battle's prize money if the holding Pokémon joins in. |
| Black Sludge | 3000 | A held item that gradually restores the HP of Poison-type Pokémon. It inflicts damage on all other types. |
| Bright Powder | 3000 | An item to be held by a Pokémon. It casts a tricky glare that lowers the opponent's accuracy. |
| Choice Band | 4000 | An item to be held by a Pokémon. This headband ups Attack, but allows the use of only one move. |
| Cleanse Tag | 5000 | An item to be held by a Pokémon. It helps keep wild Pokémon away if the holder is the first one in the party. |
| Exp. Share | 3000 | An item to be held by a Pokémon. The holder gets a share of a battle's Exp. Points without battling. |
| Focus Band | 3000 | An item to be held by a Pokémon. The holder may endure a potential KO attack, leaving it with just 1 HP. |
| King's Rock | 5000 | An item to be held by a Pokémon. When the holder inflicts damage, the target may flinch. |
| Leftovers | 4000 | An item to be held by a Pokémon. The holder's HP is gradually restored during battle. |
| Lucky Egg | 10000 | An item to be held by a Pokémon. It is an egg filled with happiness that earns extra Exp. Points in battle. |
| Macho Brace | 3000 | An item to be held by a Pokémon. It is a stiff, heavy brace that promotes strong growth but lowers Speed. |
| Mental Herb | 4000 | An item to be held by a Pokémon. It snaps the holder out of infatuation. It can be used only once. |
| Quick Claw | 3000 | An item to be held by a Pokémon. A light, sharp claw that lets the bearer move first occasionally. |
| Scope Lens | 4000 | An item to be held by a Pokémon. It is a lens that boosts the holder's critical-hit ratio. |
| Shell Bell | 4000 | An item to be held by a Pokémon. The holder's HP is restored a little every time it inflicts damage. |
| Soothe Bell | 4000 | An item to be held by a Pokémon. The comforting chime of this bell calms the holder, making it friendly. |
| White Herb | 4000 | An item to be held by a Pokémon. It restores any lowered stat in battle. It can be used only once. |

## Incensi (held, riproduzione) (8)

| Nome | Prezzo | Effetto |
|---|---|---|
| Full Incense | 5000 | An item to be held by a Pokémon. This exotic-smelling incense makes the holder bloated and slow moving. |
| Lax Incense | 5000 | An item to be held by a Pokémon. The tricky aroma of this incense may make attacks miss the holder. |
| Luck Incense | 11000 | An item to be held by a Pokémon. It doubles a battle's prize money if the holding Pokémon joins in. |
| Odd Incense | 2000 | An item to be held by a Pokémon. This exotic-smelling incense boosts the power of Psychic-type moves. |
| Pure Incense | 6000 | An item to be held by a Pokémon. It helps keep wild Pokémon away if the holder is the first one in the party. |
| Rock Incense | 2000 | An item to be held by a Pokémon. This exotic-smelling incense boosts the power of Rock-type moves. |
| Rose Incense | 2000 | An item to be held by a Pokémon. This exotic-smelling incense boosts the power of Grass-type moves. |
| Sea Incense | 2000 | An item to be held by a Pokémon. It has a curious aroma that boosts the power of Water-type moves. |

## Bacche (held) (43)

| Nome | Prezzo | Effetto |
|---|---|---|
| Aguav Berry | 20 | If held by a Pokémon, it restores the user's HP in a pinch, but will cause confusion if it hates the taste. |
| Apicot Berry | 20 | If held by a Pokémon, it raises its Sp. Def stat in a pinch. |
| Aspear Berry | 20 | It may be used or held by a Pokémon to defrost it. |
| Belue Berry | 20 | In the Sinnoh region, they like to make sweets known as Poffins with this Berry. |
| Bluk Berry | 20 | In the Sinnoh region, they like to make sweets known as Poffins with this Berry. |
| Cheri Berry | 20 | It may be used or held by a Pokémon to recover from paralysis. |
| Chesto Berry | 20 | It may be used or held by a Pokémon to recover from sleep. |
| Cornn Berry | 20 | In the Sinnoh region, they like to make sweets known as Poffins with this Berry. |
| Durin Berry | 20 | In the Sinnoh region, they like to make sweets known as Poffins with this Berry. |
| Enigma Berry | 20 | If held by a Pokémon, it restores its HP if it is hit by any supereffective attack. |
| Figy Berry | 20 | If held by a Pokémon, it restores the user's HP in a pinch, but will cause confusion if it hates the taste. |
| Ganlon Berry | 20 | If held by a Pokémon, it raises its Defense stat in a pinch. |
| Grepa Berry | 20 | Using it on a Pokémon makes it more friendly, but it also lowers its base Sp. Def stat. |
| Hondew Berry | 20 | Using it on a Pokémon makes it more friendly, but it also lowers its base Sp. Atk stat. |
| Iapapa Berry | 20 | If held by a Pokémon, it restores the user's HP in a pinch, but will cause confusion if it hates the taste. |
| Kelpsy Berry | 20 | Using it on a Pokémon makes it more friendly, but it also lowers its base Attack stat. |
| Lansat Berry | 20 | If held by a Pokémon, it raises its critical-hit ratio in a pinch. |
| Leppa Berry | 20 | It may be used or held by a Pokémon to restore a move's PP by 10. |
| Liechi Berry | 20 | If held by a Pokémon, it raises its Attack stat in a pinch. |
| Lum Berry | 20 | It may be used or held by a Pokémon to recover from any status problem. |
| Mago Berry | 20 | If held by a Pokémon, it restores the user's HP in a pinch, but will cause confusion if it hates the taste. |
| Magost Berry | 20 | In the Sinnoh region, they like to make sweets known as Poffins with this Berry. |
| Nanab Berry | 20 | In the Sinnoh region, they like to make sweets known as Poffins with this Berry. |
| Nomel Berry | 20 | In the Sinnoh region, they like to make sweets known as Poffins with this Berry. |
| Oran Berry | 20 | It may be used or held by a Pokémon to heal the user by just 10 HP. |
| Pamtre Berry | 20 | In the Sinnoh region, they like to make sweets known as Poffins with this Berry. |
| Pecha Berry | 20 | It may be used or held by a Pokémon to recover from poison. |
| Persim Berry | 20 | It may be used or held by a Pokémon to recover from confusion. |
| Petaya Berry | 20 | If held by a Pokémon, it raises its Sp. Atk stat in a pinch. |
| Pinap Berry | 20 | In the Sinnoh region, they like to make sweets known as Poffins with this Berry. |
| Pomeg Berry | 20 | Using it on a Pokémon makes it more friendly, but it also lowers its base HP. |
| Qualot Berry | 20 | Using it on a Pokémon makes it more friendly, but it also lowers its base Defense stat. |
| Rabuta Berry | 20 | In the Sinnoh region, they like to make sweets known as Poffins with this Berry. |
| Rawst Berry | 20 | It may be used or held by a Pokémon to recover from a burn. |
| Razz Berry | 20 | In the Sinnoh region, they like to make sweets known as Poffins with this Berry. |
| Salac Berry | 20 | If held by a Pokémon, it raises its Speed stat in a pinch. |
| Sitrus Berry | 20 | It may be used or held by a Pokémon to heal the user's HP a little. |
| Spelon Berry | 20 | In the Sinnoh region, they like to make sweets known as Poffins with this Berry. |
| Starf Berry | 20 | If held by a Pokémon, it sharply raises one of its stats in a pinch. |
| Tamato Berry | 20 | Using it on a Pokémon makes it more friendly, but it also lowers its base Speed stat. |
| Watmel Berry | 20 | In the Sinnoh region, they like to make sweets known as Poffins with this Berry. |
| Wepear Berry | 20 | In the Sinnoh region, they like to make sweets known as Poffins with this Berry. |
| Wiki Berry | 20 | If held by a Pokémon, it restores the user's HP in a pinch, but will cause confusion if it hates the taste. |

## Posta (Mail) (12)

| Nome | Prezzo | Effetto |
|---|---|---|
| Air Mail | 50 | Stationery featuring a print of colorful letter sets. Let a Pokémon hold it for delivery. |
| Bloom Mail | 50 | Stationery featuring a print of pretty floral patterns. Let a Pokémon hold it for delivery. |
| Brick Mail | 50 | Stationery featuring a print of a tough-looking brick pattern. Let a Pokémon hold it for delivery. |
| Bubble Mail | 50 | Stationery featuring a print of a blue world underwater. Let a Pokémon hold it for delivery. |
| Flame Mail | 50 | Stationery featuring a print of flames in blazing red. Let a Pokémon hold it for delivery. |
| Grass Mail | 50 | Stationery featuring a print of a refreshingly green field. Let a Pokémon hold it for delivery. |
| Heart Mail | 50 | Stationery featuring a print of giant heart patterns. Let a Pokémon hold it for delivery. |
| Mosaic Mail | 50 | Stationery featuring a print of a vivid rainbow pattern. Let a Pokémon hold it for delivery. |
| Snow Mail | 50 | Stationery featuring a print of a chilly, snow-covered world. Let a Pokémon hold it for delivery. |
| Space Mail | 50 | Stationery featuring a print depicting the huge expanse of space. Let a Pokémon hold it for delivery. |
| Steel Mail | 50 | Stationery featuring a print of cool mechanical designs. Let a Pokémon hold it for delivery. |
| Tunnel Mail | 50 | Stationery featuring a print of a dimly lit coal mine. Let a Pokémon hold it for delivery. |

## Chiave/altro (15)

| Nome | Prezzo | Effetto |
|---|---|---|
| Bicycle | 0 | A folding Bicycle that enables much faster movement than the Running Shoes. |
| Black Apricorn | 200 | A black Apricorn. It has an indescribable scent. |
| Blue Apricorn | 200 | A blue Apricorn. It smells a bit like grass. |
| Coin Case | 0 | A case for holding coins obtained at the Game Corner. It holds up to 99,999 coins. |
| Good Rod | 0 | A new, good-quality fishing rod. Use it by any body of water to fish for wild aquatic Pokémon. |
| Green Apricorn | 200 | A green Apricorn. It has a mysterious, aromatic scent. |
| Itemfinder | 0 | A device used for finding items. If there is a hidden item nearby when it is used, it emits a signal. |
| Old Rod | 0 | An old and beat-up fishing rod. Use it by any body of water to fish for wild aquatic Pokémon. |
| Pink Apricorn | 200 | A pink Apricorn. It has a nice, sweet scent. |
| Red Apricorn | 200 | A red Apricorn. It assails your nostrils. |
| Silph Scope | 0 | A scope that makes unseeable Pokémon visible. It is made by Silph Co. |
| Super Rod | 0 | An awesome, high-tech fishing rod. Use it by any body of water to fish for wild aquatic Pokémon. |
| Town Map | 0 | A very convenient map that can be viewed anytime. It even shows your present location. |
| White Apricorn | 200 | A white Apricorn. It doesn't smell like anything. |
| Yellow Apricorn | 200 | A yellow Apricorn. It has an invigorating scent. |