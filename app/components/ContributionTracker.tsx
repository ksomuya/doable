import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

interface ContributionDay {
  date: string; // ISO date string
  count: number; // Activity count for the day
}

interface ContributionTrackerProps {
  data: ContributionDay[];
  startDate?: Date; // Start date for the tracker (defaults to 1 year ago)
  endDate?: Date; // End date for the tracker (defaults to today)
}

const ContributionTracker = ({
  data = [],
  startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
  endDate = new Date(),
}: ContributionTrackerProps) => {
  // Convert data array to a map for easier lookup
  const activityMap = new Map<string, number>();
  data.forEach((day) => {
    activityMap.set(day.date.split("T")[0], day.count);
  });

  // Generate dates between start and end date
  const generateDates = () => {
    const dates = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const allDates = generateDates();

  // Group dates by week
  const groupByWeek = (dates: Date[]) => {
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    let currentDayOfWeek = 0;

    dates.forEach((date) => {
      const dayOfWeek = date.getDay();

      // If we're at the start of a new week (Sunday) and we have dates in the current week
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentWeek.push(date);
      currentDayOfWeek = dayOfWeek;
    });

    // Add the last week if it has any dates
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const weeks = groupByWeek(allDates);

  // Get month labels for the top of the chart
  const getMonthLabels = () => {
    const months: { month: string; position: number }[] = [];
    let currentMonth = -1;

    allDates.forEach((date, index) => {
      const month = date.getMonth();
      if (month !== currentMonth) {
        months.push({
          month: date.toLocaleString("default", { month: "short" }),
          position: index,
        });
        currentMonth = month;
      }
    });

    return months;
  };

  const monthLabels = getMonthLabels();

  // Get color based on activity count
  const getActivityColor = (count: number) => {
    if (count === 0) return "#ebedf0";
    if (count < 3) return "#9be9a8";
    if (count < 6) return "#40c463";
    if (count < 9) return "#30a14e";
    return "#216e39";
  };

  // Format date as ISO string (YYYY-MM-DD)
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Get activity count for a specific date
  const getActivityCount = (date: Date) => {
    const dateString = formatDate(date);
    return activityMap.get(dateString) || 0;
  };

  // Day labels for the left side of the chart
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <View style={styles.container}>
      {/* Month labels */}
      <View style={styles.monthLabelsContainer}>
        <View style={styles.dayLabelSpacer} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.monthLabels}>
            {monthLabels.map((label, index) => (
              <Text
                key={`${label.month}-${index}`}
                style={[
                  styles.monthLabel,
                  {
                    marginLeft:
                      index === 0
                        ? 0
                        : label.position * 14 -
                          monthLabels[index - 1].position * 14 -
                          20,
                  },
                ]}
              >
                {label.month}
              </Text>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.gridContainer}>
        {/* Day labels */}
        <View style={styles.dayLabels}>
          {dayLabels.map((day, index) => (
            <Text key={day} style={styles.dayLabel}>
              {index % 2 === 0 ? day : ""}
            </Text>
          ))}
        </View>

        {/* Contribution grid */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.grid}>
            {weeks.map((week, weekIndex) => (
              <View key={`week-${weekIndex}`} style={styles.week}>
                {week.map((day) => {
                  const count = getActivityCount(day);
                  return (
                    <View
                      key={formatDate(day)}
                      style={[
                        styles.day,
                        { backgroundColor: getActivityColor(count) },
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        {[0, 2, 5, 8, 10].map((count) => (
          <View
            key={`legend-${count}`}
            style={[
              styles.legendItem,
              { backgroundColor: getActivityColor(count) },
            ]}
          />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  monthLabelsContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayLabelSpacer: {
    width: 30,
  },
  monthLabels: {
    flexDirection: "row",
    height: 20,
  },
  monthLabel: {
    fontSize: 12,
    color: "#586069",
    position: "absolute",
  },
  gridContainer: {
    flexDirection: "row",
  },
  dayLabels: {
    marginRight: 4,
    width: 30,
  },
  dayLabel: {
    fontSize: 12,
    color: "#586069",
    height: 14,
    textAlign: "right",
    paddingRight: 4,
  },
  grid: {
    flexDirection: "row",
  },
  week: {
    flexDirection: "column",
    marginRight: 2,
  },
  day: {
    width: 12,
    height: 12,
    margin: 1,
    borderRadius: 2,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#586069",
    marginHorizontal: 4,
  },
  legendItem: {
    width: 12,
    height: 12,
    marginHorizontal: 2,
    borderRadius: 2,
  },
});

export default ContributionTracker;
