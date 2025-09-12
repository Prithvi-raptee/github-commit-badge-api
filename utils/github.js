// utils/github.js

const { graphql } = require("@octokit/graphql");

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`,
  },
});

const getPeriodInDays = (period) => {
    switch (period) {
        case 'week': return 7;
        case 'month': return 30;
        case 'quarter': return 90;
        case 'half': return 182;
        case 'year': return 365;
        default: return 30;
    }
};

const fetchAndCalculateAverage = async (account, period) => {
    try {
        const query = `
        query($login: String!) {
          user(login: $login) {
            contributionsCollection {
              contributionCalendar {
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }`;

        const { user } = await graphqlWithAuth(query, { login: account });
        if (!user) return { error: 'user not found' };

        const allDays = user.contributionsCollection.contributionCalendar.weeks.flatMap(w => w.contributionDays);
        allDays.sort((a, b) => new Date(b.date) - new Date(a.date));

        const daysInPeriod = getPeriodInDays(period);
        const relevantDays = allDays.slice(0, daysInPeriod);

        const totalCommits = relevantDays.reduce((sum, day) => sum + day.contributionCount, 0);
        const average = (totalCommits / daysInPeriod).toFixed(2);
        const sparklineData = relevantDays.slice(0, 7).reverse().map(day => day.contributionCount);

        return { average, sparklineData };
    } catch (error) {
        if (error.message.includes("Could not resolve to a User")) {
             return { error: 'user not found' };
        }
        return { error: 'api error' };
    }
};

module.exports = { fetchAndCalculateAverage };