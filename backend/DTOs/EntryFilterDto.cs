using Microsoft.AspNetCore.Mvc;

namespace backend.DTOs
{
    public class EntryFilterDto
    {
        [FromQuery(Name = "startDate")]
        public DateTime? StartDate { get; set; }

        [FromQuery(Name = "endDate")]
        public DateTime? EndDate { get; set; }

        [FromQuery(Name = "labelNames")]
        public List<string>? LabelNames { get; set; }
    }
}