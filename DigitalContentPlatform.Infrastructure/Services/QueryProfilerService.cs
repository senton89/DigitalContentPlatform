using Microsoft.Extensions.Logging;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace DigitalContentPlatform.Infrastructure.Services
{
    public class QueryProfilerService
    {
        private readonly ILogger<QueryProfilerService> _logger;
        private readonly ConcurrentDictionary<string, List<long>> _queryTimes = new ConcurrentDictionary<string, List<long>>();
        private readonly int _maxSamples = 100;

        public QueryProfilerService(ILogger<QueryProfilerService> logger)
        {
            _logger = logger;
        }

        public IDisposable Profile(string queryName)
        {
            return new QueryProfiler(this, queryName);
        }

        internal void RecordQueryTime(string queryName, long elapsedMilliseconds)
        {
            _queryTimes.AddOrUpdate(
                queryName,
                _ => new List<long> { elapsedMilliseconds },
                (_, list) =>
                {
                    if (list.Count >= _maxSamples)
                    {
                        list.RemoveAt(0);
                    }
                    list.Add(elapsedMilliseconds);
                    return list;
                });

            _logger.LogDebug($"Query '{queryName}' executed in {elapsedMilliseconds}ms");
        }

        public Dictionary<string, QueryStats> GetQueryStats()
        {
            return _queryTimes.ToDictionary(
                kvp => kvp.Key,
                kvp => new QueryStats
                {
                    AverageTime = kvp.Value.Count > 0 ? kvp.Value.Average() : 0,
                    MinTime = kvp.Value.Count > 0 ? kvp.Value.Min() : 0,
                    MaxTime = kvp.Value.Count > 0 ? kvp.Value.Max() : 0,
                    SampleCount = kvp.Value.Count
                });
        }

        public void ClearStats()
        {
            _queryTimes.Clear();
        }

        private class QueryProfiler : IDisposable
        {
            private readonly QueryProfilerService _service;
            private readonly string _queryName;
            private readonly Stopwatch _stopwatch;

            public QueryProfiler(QueryProfilerService service, string queryName)
            {
                _service = service;
                _queryName = queryName;
                _stopwatch = Stopwatch.StartNew();
            }

            public void Dispose()
            {
                _stopwatch.Stop();
                _service.RecordQueryTime(_queryName, _stopwatch.ElapsedMilliseconds);
            }
        }
    }

    public class QueryStats
    {
        public double AverageTime { get; set; }
        public long MinTime { get; set; }
        public long MaxTime { get; set; }
        public int SampleCount { get; set; }
    }
}
