window.LEAGUE_OVERRIDES={
  "MLB": {
    "country": "USA",
    "level": 5,
    "conferences": {
      "American League": {
        "divisions": {
          "AL East": [
            "BAL Orioles",
            "BOS Red Sox",
            "NYY Yankees",
            "TB Rays",
            "TOR Blue Jays"
          ],
          "AL Central": [
            "CWS White Sox",
            "CLE Guardians",
            "DET Tigers",
            "KC Royals",
            "MIN Twins"
          ],
          "AL West": [
            "HOU Astros",
            "LAA Angels",
            "OAK Athletics",
            "SEA Mariners",
            "TEX Rangers"
          ]
        }
      },
      "National League": {
        "divisions": {
          "NL East": [
            "ATL Braves",
            "MIA Marlins",
            "NYM Mets",
            "PHI Phillies",
            "WSH Nationals"
          ],
          "NL Central": [
            "CHC Cubs",
            "CIN Reds",
            "MIL Brewers",
            "PIT Pirates",
            "STL Cardinals"
          ],
          "NL West": [
            "ARI Diamondbacks",
            "COL Rockies",
            "LAD Dodgers",
            "SD Padres",
            "SF Giants"
          ]
        }
      }
    },
    "signingDifficulty": 5
  },
  "NPB": {
    "country": "Japan",
    "level": 5,
    "divisions": {
      "Central": [],
      "Pacific": []
    },
    "signingDifficulty": 4
  },
  "KBO": {
    "country": "Korea",
    "level": 4,
    "divisions": {
      "KBO League": []
    },
    "signingDifficulty": 4
  },
  "CPBL": {
    "country": "Taiwan",
    "level": 4,
    "divisions": {
      "CPBL": []
    },
    "signingDifficulty": 3
  },
  "CNBL": {
    "country": "China",
    "level": 2,
    "divisions": {
      "CBL North": [
        "Beijing Tigers",
        "Tianjin Lions",
        "Shanghai Golden Eagles",
        "Jiangsu Pegasus"
      ],
      "CBL South": [
        "Guangdong Leopards",
        "Sichuan Dragons"
      ]
    },
    "signingDifficulty": 2
  },
  "ABL": {
    "country": "Australia",
    "level": 3,
    "divisions": {
      "ABL": [
        "Adelaide Giants",
        "Auckland Tuatara",
        "Brisbane Bandits",
        "Canberra Cavalry",
        "Melbourne Aces",
        "Perth Heat",
        "Sydney Blue Sox"
      ]
    },
    "signingDifficulty": 2
  }
};
(function(){const O=window.LEAGUE_OVERRIDES;window.App=window.App||{};const L=window.App.leagues||{};window.App.leagues={...O,...L};})();