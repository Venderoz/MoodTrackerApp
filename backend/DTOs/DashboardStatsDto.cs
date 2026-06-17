namespace backend.DTOs
{
    public class DashboardStatsDto
    {
        public List<SparklineDataDto> Sparklines { get; set; } = new();
        public int FrequentMood { get; set; }
        public double AvgSleep { get; set; }
        public List<TopTagDto> TopTags { get; set; } = new();
    }

    public class SparklineDataDto
    {
        public string DateStr { get; set; } = string.Empty;
        public int Mood { get; set; }
        public double Sleep { get; set; }
    }

    public class TopTagDto
    {
        public string Name { get; set; } = string.Empty;
        public int Value { get; set; }
        public string Color { get; set; } = string.Empty;
    }
}